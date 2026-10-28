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

    def test_parses_sheet_serial_dates_and_times(self):
        self.assertEqual(parse_date(46315), "2026-10-20")
        self.assertAlmostEqual(parse_time(0.5), 720)

    def test_missing_identifier_fails_without_building_partial_cache(self):
        values = [HEADERS, ["20/10/2026", "", "Sea", 0.4, 0.5, 0, 0, 1, 1, 0, 0, 0]]
        with self.assertRaisesRegex(ValueError, "missing its id"):
            build_cache(values)

    def test_required_headers_are_validated(self):
        with self.assertRaisesRegex(ValueError, "Missing required columns"):
            build_cache([["date", "id"]])


if __name__ == "__main__":
    unittest.main()
