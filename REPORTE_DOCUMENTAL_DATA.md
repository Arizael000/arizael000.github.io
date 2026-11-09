# Operational dashboard data

The public dashboard reads only `data/reporte-documental.json`; visitors do not
call Google Sheets automatically. GitHub Actions refreshes that cache once per
day at 6:00 PM in Costa Rica (`00:00 UTC` on the following day), and can also be
run manually from **Actions → Refresh operational dashboard cache → Run
workflow**. GitHub may delay scheduled jobs during periods of high load.

The **Refresh data** button explicitly requests the latest public-sheet values
from the browser and updates the dashboard in memory. It does not write or
commit the cache; a page reload returns to the latest scheduled cache. The live
query uses `id` only in memory to apply the same last-row-wins rule as the cache
builder, then discards it before producing anonymized case summaries and
aggregates by date and type. A failed request leaves the currently displayed
data intact and reports the error. Both refresh methods require the sheet to
allow link-based viewing.

## Google Sheets source

The refresh script reads the public, shipment-free sheet
[hojaPublica](https://docs.google.com/spreadsheets/d/19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c/edit?usp=sharing)
through Google's public Visualization endpoint for the `hojaPublica` tab.
Required headers are:

`date`, `id`, `type`, `startTime`, `endTime`, `lateCorrections`,
`lateErrors`, `fQuantity`, `plQuantity`, `apportionmentQ`,
`lateApportionment`, `changesPkgsWeightFreight`.

The `id` column is used only to treat the last non-empty row for an ID as the
current version. IDs are never written to the cache or rendered by the dashboard. The
cache contains daily aggregates by `date` and `type`, plus case-level summaries
with generated labels, date, type, start/end time, elapsed minutes, invoice and
packing-list counts, and links to other generated labels whose time intervals
overlap. The original IDs, counterparties, and shipment references are
excluded. Because the case-level counts and timing are served by GitHub Pages,
those details are public.

## Workflow setup

The sheet is publicly readable, so the scheduled workflow uses Google's public
Visualization endpoint and does not require an API key or GitHub secret.
Ensure Actions are enabled and the workflow has permission to write repository
contents; it commits the cache only when the data changes. Run the workflow
manually from **Actions → Refresh operational dashboard cache → Run workflow**
to publish an update immediately. If fetching or validating the sheet fails,
the workflow fails and the previously committed cache remains available.

The sheet is currently shared with anyone who has its link. Do not add
shipment details or confidential values to this source; if the aggregates
themselves must be private, GitHub Pages is not an appropriate hosting target.

## Metrics and filters

- Processing time is `endTime - startTime`; source and cache totals are stored
  in minutes, while averages in the dashboard are displayed in hours. Intervals
  crossing midnight are handled as overnight durations.
- Every clock time from 00:00 to 23:59 is valid. Entries outside the usual
  08:00–18:00 workday (for example overtime or early starts) are used exactly as
  stored: they are not shifted, reclassified, or rejected because of their hour.
  Case intervals are displayed in 24-hour time. Only malformed values (for
  example `24:00` or `12:60`) are rejected. Because the dashboard no longer
  guesses between AM and PM, the sheet must store ambiguous times in an
  unambiguous way (24-hour input or an explicit AM/PM marker).
- In the live Google Visualization response, a date-only `Date(1899,11,30)`
  value is an empty time cell, not midnight. Explicit midnight values include
  time components and remain valid. If there are no complete start/end pairs,
  the dashboard shows time metrics as unavailable instead of reporting zero.
- Average processing time is the sum of durations divided by the number of
  records with both start and end times.
- A case is counted as started during another case when its start timestamp
  falls within at least one other recorded processing interval. Cases starting
  at the same time count as overlapping; intervals ending at that instant do
  not.
- The case analysis displays generated labels rather than source IDs.
  `fQuantity` is shown as invoice count, and `plQuantity` as packing-list
  count. Its minimum and maximum invoice filters narrow the cases in the
  analysis. The duration chart can show individual cases or group cases with
  the same elapsed duration to the nearest second; selecting a duration group
  limits the table and **Case Details** navigation to that group. Cases with
  any shared interval are listed on both cases, even when neither case started
  inside the other's interval.
- Error and correction rates are shown as total events per 100 records of each
  type. They can exceed 100 when a record contains multiple events.
- Volume can be grouped by week (Monday start) or month.
- The scatter plot uses date/type aggregate averages, not individual rows.
- Date and type filters apply across all cards and charts.
- Shipment-level critical-case ranking is intentionally unavailable because
  this source omits shipment identifiers.

The script validates the required headers and values before atomically replacing
the cache. If the sheet request or validation fails, the workflow fails and the
previous cache remains available.
