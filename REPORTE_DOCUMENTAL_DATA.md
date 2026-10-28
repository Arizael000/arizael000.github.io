# Operational dashboard data

The public dashboard reads only `data/reporte-documental.json`; visitors do not
call Google Sheets automatically. GitHub Actions refreshes that cache once per
day at 6:00 PM in Costa Rica (`00:00 UTC` on the following day), and can also be
run manually from **Actions → Refresh operational dashboard cache → Run
workflow**. GitHub may delay scheduled jobs during periods of high load.

The **Refresh data** button explicitly requests the latest public-sheet values
from the browser and updates the dashboard in memory. It does not write or
commit the cache; a page reload returns to the latest scheduled cache. The live
query excludes the `id` column and only aggregates rows by date and type. A
failed request leaves the currently displayed data intact and reports the
error. This manual refresh requires the sheet to allow link-based viewing and a
browser connection to Google.

## Google Sheets source

The refresh script reads the public, shipment-free sheet
[hojaPublica](https://docs.google.com/spreadsheets/d/19TxYbxkkO-JB68yoxrBlBN567YLAUtpJynyyog49b0c/edit?usp=sharing)
using the Google Sheets API v4 range `hojaPublica!A:L`. Required headers are:

`date`, `id`, `type`, `startTime`, `endTime`, `lateCorrections`,
`lateErrors`, `fQuantity`, `plQuantity`, `apportionmentQ`,
`lateApportionment`, `changesPkgsWeightFreight`.

The `id` column is used only by the refresh job to treat the last non-empty row
for an ID as the current version. IDs are never written to the cache. The cache
contains daily aggregates by `date` and `type`, with counts, metric totals,
processing-time totals, and timed-record counts. It contains no row-level
records, shipment identifiers, or shipment ranking. Because this cache is
served by GitHub Pages, all aggregate values in it are public.

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
   the secret; until then the page shows that the cache is waiting for its
   first refresh.

The sheet is currently shared with anyone who has its link. The API key does
not make a public sheet private. Do not add shipment details or confidential
values to this source; if the aggregates themselves must be private, GitHub
Pages is not an appropriate hosting target.

## Metrics and filters

- Processing time is `endTime - startTime`, in minutes; intervals crossing
  midnight are handled as overnight durations.
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
