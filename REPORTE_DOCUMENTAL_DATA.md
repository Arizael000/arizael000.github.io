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
data intact and reports the error. This manual refresh requires the sheet to
allow link-based viewing and a browser connection to Google.

## Google Sheets source

The refresh script reads the public, shipment-free sheet
[hojaPublica](https://docs.google.com/spreadsheets/d/19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c/edit?usp=sharing)
using the Google Sheets API v4 range `hojaPublica!A:L`. Required headers are:

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

## One-time setup

1. In Google Cloud Console, enable **Google Sheets API** for a project and
   create an API key. Restrict the key to the Google Sheets API. Do not put it
   in HTML, JavaScript, the generated cache, or this repository.
2. In the GitHub repository, add an Actions repository secret named
   `GOOGLE_SHEETS_API_KEY` with that key.
3. Ensure Actions are enabled and repository workflow permissions allow
   write access to contents. The scheduled job commits the cache only when it
   changes.
4. Run the workflow manually once and check its result. The first run requires
   the secret. If it is unavailable, the site continues serving the latest
   committed cache rather than discarding the previously published data.

The sheet is currently shared with anyone who has its link. The API key does
not make a public sheet private. Do not add shipment details or confidential
values to this source; if the aggregates themselves must be private, GitHub
Pages is not an appropriate hosting target.

## Metrics and filters

- Processing time is `endTime - startTime`; source and cache totals are stored
  in minutes, while averages in the dashboard are displayed in hours. Intervals
  crossing midnight are handled as overnight durations.
- This operation's valid workday is 08:00–18:00. Imported times before 08:00
  are normalized by adding 12 hours when that places them within the workday
  (for example, `1:43` becomes `13:43`); values still outside that range are
  rejected rather than silently treated as valid durations. Case intervals are
  displayed in 24-hour time.
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
the cache. If the API request or validation fails, the workflow fails and the
previous cache remains available.
