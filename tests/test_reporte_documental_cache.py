import json
import unittest

from scripts.build_reporte_documental_cache import build_cache, parse_date, parse_time


HEADERS = [
    "date",
    "id",
    "type",
    "startTime",
    "endTime",
    "lateCorrections",
    "lateErrors",
    "fQuantity",
    "plQuantity",
    "apportionmentQ",
    "lateApportionment",
    "changesPkgsWeightFreight",
]


class ReporteDocumentalCacheTests(unittest.TestCase):
    def test_builds_daily_type_aggregates_without_identifiers(self):
        values = [
            HEADERS,
            ["20/10/2026", "internal-1", "Sea", 9 / 24, 9.5 / 24, 1, 0, 3, 1, 0, 0, 1],
            ["20/10/2026", "internal-1", "Sea", 10 / 24, 10.5 / 24, 2, 1, 4, 2, 1, 1, 2],
            ["20/10/2026", "internal-2", "Sea", 11 / 24, 11.5 / 24, 0, 1, 5, 3, 0, 0, 1],
        ]

        cache = build_cache(values, "2026-10-28T00:00:00+00:00")
        self.assertEqual(cache["meta"]["recordCount"], 2)
        self.assertEqual(len(cache["records"]), 1)
        aggregate = cache["records"][0]
        self.assertEqual(aggregate["recordCount"], 2)
        self.assertEqual(aggregate["timedRecordCount"], 2)
        self.assertAlmostEqual(aggregate["processingMinutes"], 60)
        self.assertEqual(aggregate["lateCorrections"], 2)
        self.assertEqual(aggregate["lateErrors"], 2)
        self.assertNotIn("id", aggregate)
        self.assertNotIn("internal-1", json.dumps(cache))
        self.assertNotIn("internal-2", json.dumps(cache))
        self.assertEqual(len(cache["cases"]), 2)
        self.assertEqual(cache["cases"][0]["invoiceCount"], 4)
        self.assertEqual(cache["cases"][0]["caseNumber"], "Case 001")
        self.assertNotIn("internal-1", json.dumps(cache["cases"]))
        self.assertNotIn("startMinute", json.dumps(cache["records"]))
        self.assertNotIn("processingMinutes", json.dumps(cache["cases"]))

    def test_parses_sheet_serial_dates_and_times(self):
        self.assertEqual(parse_date(46315), "2026-10-20")
        self.assertAlmostEqual(parse_time(0.5), 720)
        self.assertEqual(parse_time(0), 0)

    def test_normalizes_early_sheet_times_to_afternoon_within_workday(self):
        values = [
            HEADERS,
            ["20/10/2026", "early-start", "Land", "1:43", "13:55", 0, 0, 1, 1, 0, 0, 0],
            ["21/10/2026", "midnight-start", "Land", "0:50", "13:07", 0, 0, 1, 1, 0, 0, 0],
            ["22/10/2026", "numeric-start", "Land", 103 / 1440, 835 / 1440, 0, 0, 1, 1, 0, 0, 0],
        ]

        cases = build_cache(values)["cases"]
        self.assertEqual(cases[0]["startMinute"], 823)
        self.assertEqual(cases[0]["durationMinutes"], 12)
        self.assertEqual(cases[1]["startMinute"], 770)
        self.assertEqual(cases[1]["durationMinutes"], 17)
        self.assertEqual(cases[2]["startMinute"], 823)
        self.assertAlmostEqual(cases[2]["durationMinutes"], 12)

    def test_rejects_times_outside_expected_workday(self):
        values = [
            HEADERS,
            ["20/10/2026", "late-start", "Land", "18:01", "18:10", 0, 0, 1, 1, 0, 0, 0],
        ]

        with self.assertRaisesRegex(ValueError, "outside the expected 08:00-18:00 workday"):
            build_cache(values)

    def test_workday_durations_are_included(self):
        values = [
            HEADERS,
            ["20/10/2026", "morning", "Sea", 8.5 / 24, 9.25 / 24, 0, 0, 1, 1, 0, 0, 0],
            ["22/10/2026", "closing", "Sea", 17.75 / 24, 18 / 24, 0, 0, 1, 1, 0, 0, 0],
        ]

        cache = build_cache(values)
        self.assertEqual(cache["meta"]["recordCount"], 2)
        self.assertEqual(cache["records"][0]["timedRecordCount"], 1)
        self.assertAlmostEqual(cache["records"][0]["processingMinutes"], 45)
        self.assertEqual(cache["records"][1]["timedRecordCount"], 1)
        self.assertAlmostEqual(cache["records"][1]["processingMinutes"], 15)

    def test_counts_cases_started_during_another_timed_case(self):
        values = [
            HEADERS,
            ["20/10/2026", "first", "Sea", 8 / 24, 9 / 24, 0, 0, 1, 1, 0, 0, 0],
            ["20/10/2026", "second", "Sea", 8.25 / 24, 8.5 / 24, 0, 0, 1, 1, 0, 0, 0],
            ["20/10/2026", "third", "Sea", 8.5 / 24, 9.25 / 24, 0, 0, 1, 1, 0, 0, 0],
            ["20/10/2026", "after", "Sea", 9.25 / 24, 9.5 / 24, 0, 0, 1, 1, 0, 0, 0],
        ]

        cache = build_cache(values)
        aggregates = {record["date"]: record for record in cache["records"]}
        self.assertEqual(aggregates["2026-10-20"]["overlappingStartCount"], 2)
        cases = {case["caseNumber"]: case for case in cache["cases"]}
        self.assertEqual(cases["Case 001"]["overlapsWith"], ["Case 002", "Case 003"])
        self.assertEqual(cases["Case 002"]["overlapsWith"], ["Case 001"])
        self.assertEqual(cases["Case 003"]["overlapsWith"], ["Case 001"])
        self.assertEqual(cases["Case 004"]["overlapsWith"], [])
        self.assertNotIn("startMinute", json.dumps(cache["records"]))
        self.assertIn("startMinute", json.dumps(cache["cases"]))
        self.assertNotIn("startedDuringAnother", json.dumps(cache))

    def test_missing_identifier_fails_without_building_partial_cache(self):
        values = [HEADERS, ["20/10/2026", "", "Sea", 0.4, 0.5, 0, 0, 1, 1, 0, 0, 0]]
        with self.assertRaisesRegex(ValueError, "missing its id"):
            build_cache(values)

    def test_required_headers_are_validated(self):
        with self.assertRaisesRegex(ValueError, "Missing required columns"):
            build_cache([["date", "id"]])


if __name__ == "__main__":
    unittest.main()
