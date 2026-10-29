#!/usr/bin/env python3
"""Fetch the public-sheet source and write an identifier-free aggregate cache."""

import json
import math
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, time, timedelta, timezone
from pathlib import Path


SPREADSHEET_ID = "19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c"
SHEET_RANGE = "hojaPublica!A:L"
SHEET_EPOCH = datetime(1899, 12, 30)
WORKDAY_START_MINUTES = 8 * 60
WORKDAY_END_MINUTES = 18 * 60
METRIC_FIELDS = (
    "lateCorrections",
    "lateErrors",
    "fQuantity",
    "plQuantity",
    "apportionmentQ",
    "lateApportionment",
    "changesPkgsWeightFreight",
)
REQUIRED_FIELDS = ("date", "id", "type", "startTime", "endTime") + METRIC_FIELDS
OUTPUT_PATH = Path(__file__).resolve().parents[1] / "data" / "reporte-documental.json"


def parse_date(value):
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            raise ValueError("invalid numeric date")
        return (SHEET_EPOCH + timedelta(days=float(value))).date().isoformat()

    text = str(value).strip()
    for pattern in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(text, pattern).date().isoformat()
        except ValueError:
            pass
    raise ValueError("unsupported date value")


def parse_time(value):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            raise ValueError("invalid numeric time")
        return (float(value) % 1) * 1440

    text = str(value).strip()
    for pattern in ("%H:%M:%S", "%H:%M", "%I:%M:%S %p", "%I:%M %p"):
        try:
            return datetime.strptime(text, pattern).time()
        except ValueError:
            pass
    try:
        return datetime.fromisoformat(text).time()
    except ValueError as error:
        raise ValueError("unsupported time value") from error


def time_minutes(value):
    parsed = parse_time(value)
    if parsed is None:
        return None
    if isinstance(parsed, time):
        minutes = parsed.hour * 60 + parsed.minute + parsed.second / 60
    else:
        minutes = parsed
    if minutes < WORKDAY_START_MINUTES:
        minutes += 12 * 60
    if minutes < WORKDAY_START_MINUTES or minutes > WORKDAY_END_MINUTES:
        raise ValueError("time is outside the expected 08:00-18:00 workday")
    return minutes


def parse_number(value, row_number, field):
    if value is None or value == "":
        return 0.0
    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError("row {} has an invalid {}".format(row_number, field)) from error
    if not math.isfinite(number):
        raise ValueError("row {} has a non-finite {}".format(row_number, field))
    return number


def normalize_rows(values):
    if not values:
        raise ValueError("The Google Sheet returned no header row.")
    headers = [str(value).strip() for value in values[0]]
    missing = [field for field in REQUIRED_FIELDS if field not in headers]
    if missing:
        raise ValueError("Missing required columns: {}.".format(", ".join(missing)))

    positions = {header: index for index, header in enumerate(headers)}
    by_id = {}
    for row_number, cells in enumerate(values[1:], start=2):
        if not any(value not in (None, "") for value in cells):
            continue

        id_index = positions["id"]
        id_value = cells[id_index] if id_index < len(cells) else ""
        identifier = "" if id_value is None else str(id_value).strip()
        if not identifier:
            raise ValueError("row {} is missing its id; no cache was written.".format(row_number))

        def cell(field):
            index = positions[field]
            return cells[index] if index < len(cells) else ""

        try:
            record_date = parse_date(cell("date"))
            record_type = str(cell("type")).strip()
            start = time_minutes(cell("startTime"))
            end = time_minutes(cell("endTime"))
        except ValueError as error:
            raise ValueError(
                "row {} has invalid date, type, or time data: {}.".format(row_number, error)
            ) from error
        if not record_type:
            raise ValueError("row {} is missing its type.".format(row_number))

        elapsed = None
        if start is not None and end is not None:
            elapsed = end - start
            if elapsed < 0:
                elapsed += 1440

        record = {
            "date": record_date,
            "type": record_type,
            "processingMinutes": elapsed,
            "startMinute": start,
            "endMinute": end,
        }
        for field in METRIC_FIELDS:
            record[field] = parse_number(cell(field), row_number, field)
            if record[field] < 0:
                raise ValueError("row {} has a negative {}.".format(row_number, field))

        # A repeated ID represents an edited row; the last non-empty sheet row wins.
        by_id[identifier] = record

    return list(by_id.values())


def build_public_cases(records):
    ordered = sorted(
        records,
        key=lambda record: (
            record["date"],
            record["startMinute"] is None,
            record["startMinute"] if record["startMinute"] is not None else 0,
            record["type"],
        ),
    )
    cases = []
    start_times = []
    for index, record in enumerate(ordered, start=1):
        cases.append({
            "caseNumber": "Case {:03d}".format(index),
            "date": record["date"],
            "type": record["type"],
            "startMinute": record["startMinute"],
            "endMinute": record["endMinute"],
            "durationMinutes": record["processingMinutes"],
            "invoiceCount": record["fQuantity"],
            "packingListCount": record["plQuantity"],
            "overlapsWith": [],
        })
        if record["startMinute"] is None or record["processingMinutes"] is None:
            start_times.append(None)
        else:
            day = datetime.strptime(record["date"], "%Y-%m-%d").date().toordinal()
            start_times.append(day * 1440 + record["startMinute"])

    for index, case in enumerate(cases):
        start_at = start_times[index]
        duration = case["durationMinutes"]
        if start_at is None or duration is None or duration <= 0:
            continue
        end_at = start_at + duration
        for other_index in range(index + 1, len(cases)):
            other_start = start_times[other_index]
            other_duration = cases[other_index]["durationMinutes"]
            if other_start is None or other_duration is None or other_duration <= 0:
                continue
            if max(start_at, other_start) < min(end_at, other_start + other_duration):
                case["overlapsWith"].append(cases[other_index]["caseNumber"])
                cases[other_index]["overlapsWith"].append(case["caseNumber"])

    return cases


def mark_overlapping_starts(records):
    events = []
    for record in records:
        start = record["startMinute"]
        if start is None:
            continue
        start_at = parse_date(record["date"])
        day = datetime.strptime(start_at, "%Y-%m-%d").date().toordinal()
        start_at = day * 1440 + start
        events.append((start_at, 1, record))
        duration = record["processingMinutes"]
        if duration is not None and duration > 0:
            events.append((start_at + duration, 0, record))

    events.sort(key=lambda event: (event[0], event[1]))
    active_count = 0
    index = 0
    while index < len(events):
        time_at, _, _ = events[index]
        end_count = 0
        start_records = []
        while index < len(events) and events[index][0] == time_at:
            _, event_type, record = events[index]
            if event_type == 0:
                end_count += 1
            else:
                start_records.append(record)
            index += 1

        active_count -= end_count
        active_starts = sum(
            1 for record in start_records
            if record["processingMinutes"] is not None and record["processingMinutes"] > 0
        )
        for record in start_records:
            is_active = record["processingMinutes"] is not None and record["processingMinutes"] > 0
            if active_count + active_starts - int(is_active) > 0:
                record["startedDuringAnother"] = True
        active_count += active_starts


def build_cache(values, generated_at=None):
    normalized = normalize_rows(values)
    mark_overlapping_starts(normalized)
    grouped = defaultdict(
        lambda: {
            "recordCount": 0,
            "timedRecordCount": 0,
            "processingMinutes": 0.0,
            "overlappingStartCount": 0,
            "lateCorrections": 0.0,
            "lateErrors": 0.0,
            "fQuantity": 0.0,
            "plQuantity": 0.0,
            "apportionmentQ": 0.0,
            "lateApportionment": 0.0,
            "changesPkgsWeightFreight": 0.0,
        }
    )

    for record in normalized:
        key = (record["date"], record["type"])
        aggregate = grouped[key]
        aggregate["recordCount"] += 1
        if record["processingMinutes"] is not None:
            aggregate["timedRecordCount"] += 1
            aggregate["processingMinutes"] += record["processingMinutes"]
        if record.get("startedDuringAnother"):
            aggregate["overlappingStartCount"] += 1
        for field in METRIC_FIELDS:
            aggregate[field] += record[field]

    records = [
        {"date": record_date, "type": record_type, **aggregate}
        for (record_date, record_type), aggregate in sorted(grouped.items())
    ]
    return {
        "meta": {
            "generatedAt": generated_at or datetime.now(timezone.utc).isoformat(),
            "source": "Google Sheets API",
            "recordCount": len(normalized),
        },
        "records": records,
        "cases": build_public_cases(normalized),
    }


def fetch_sheet_values(api_key):
    quoted_range = urllib.parse.quote(SHEET_RANGE, safe="!")
    query = urllib.parse.urlencode(
        {
            "majorDimension": "ROWS",
            "valueRenderOption": "UNFORMATTED_VALUE",
            "key": api_key,
        }
    )
    url = "https://sheets.googleapis.com/v4/spreadsheets/{}/values/{}?{}".format(
        SPREADSHEET_ID, quoted_range, query
    )
    request = urllib.request.Request(url, headers={"Accept": "application/json"})

    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.load(response)
            return payload.get("values", [])
        except urllib.error.HTTPError as error:
            if error.code in (429, 500, 502, 503, 504) and attempt < 2:
                import time as time_module

                time_module.sleep(2**attempt)
                continue
            raise RuntimeError(
                "Google Sheets API returned HTTP {}. Check API enablement, key restrictions, "
                "and sheet access.".format(error.code)
            ) from None
        except (urllib.error.URLError, TimeoutError) as error:
            if attempt < 2:
                import time as time_module

                time_module.sleep(2**attempt)
                continue
            raise RuntimeError(
                "Could not reach the Google Sheets API: {}.".format(error.reason)
            ) from None
        except json.JSONDecodeError as error:
            raise RuntimeError("Google Sheets API returned invalid JSON.") from error
    raise RuntimeError("Google Sheets API request failed after retries.")


def main():
    api_key = os.environ.get("GOOGLE_SHEETS_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Set the GOOGLE_SHEETS_API_KEY environment variable.")

    cache = build_cache(fetch_sheet_values(api_key))
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = OUTPUT_PATH.with_suffix(".json.tmp")
    temporary_path.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary_path.replace(OUTPUT_PATH)
    print(
        "Updated aggregate cache: {} records across {} date/type groups.".format(
            cache["meta"]["recordCount"], len(cache["records"])
        )
    )


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError) as error:
        print("Cache update failed: {}".format(error), file=sys.stderr)
        sys.exit(1)
