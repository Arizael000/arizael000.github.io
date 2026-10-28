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
        return parsed.hour * 60 + parsed.minute + parsed.second / 60
    return parsed


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
            raise ValueError("row {} has invalid date, type, or time data.".format(row_number)) from error
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
        }
        for field in METRIC_FIELDS:
            record[field] = parse_number(cell(field), row_number, field)
            if record[field] < 0:
                raise ValueError("row {} has a negative {}.".format(row_number, field))

        # A repeated ID represents an edited row; the last non-empty sheet row wins.
        by_id[identifier] = record

    return list(by_id.values())


def build_cache(values, generated_at=None):
    normalized = normalize_rows(values)
    grouped = defaultdict(
        lambda: {
            "recordCount": 0,
            "timedRecordCount": 0,
            "processingMinutes": 0.0,
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
