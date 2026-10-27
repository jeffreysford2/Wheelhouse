# Wheelhouse

A research site for new cars sold in the US (model year 2026 for now).
Visitors filter every model by what matters to them, open a model to see its
trims, and (soon) compare up to six trims side by side.

There are two separate pieces, and keeping them apart is what keeps the
system simple:

1. **The data pipeline** (`pipeline/`) reads the car data (today,
   hand-collected CSV files), merges and checks it, and writes static JSON to
   `public/data/`.
2. **The website** (`web/`) is a React app served as static files. The browser
   downloads the JSON once and does all filtering, sorting and search itself.
   There is no database and no search server.

```
wheelhouse/
  shared/carTypes.ts   the Model and Trim types, used by both pieces
  pipeline/            data job (Node + TypeScript)
    curated/           hand-collected trims and prices (CSV), the current catalog
    sources/           one adapter per data source (curated catalog; CarAPI, EPA, NHTSA stubs)
    match.ts           rules for matching records across sources
    validate.ts        sanity checks before publishing
    build.ts           writes the JSON files
    run.ts             the pipeline run itself
  web/                 the React site
    src/data/          loading the JSON, filter, sort and search logic
    src/components/    cards, filters, chips, search box
    src/pages/         Results, ModelDetail, Compare
    src/theme/         light and dark color variables
    e2e/               Playwright tests of the main flows
  public/data/         generated JSON (do not edit by hand)
```

## Running it

Needs Node 22.

```sh
npm install
npm run dev          # site at http://localhost:5173
npm test             # unit tests (Vitest) for the pipeline and the filter logic
npm run test:e2e     # browser tests (Playwright), builds the site first
npm run typecheck
npm run build        # production build in web/dist
npm run pipeline     # rebuild public/data from pipeline/curated (offline, free)
```

## The data

`public/data/` holds the **40 best-selling 2026 models** (ranked by 2025 US
sales). Their trims and prices were collected by hand from manufacturer press
sites and pricing articles, because Jeff chose a $0 start over a paid catalog
API on 2026-10-26. The source files are in `pipeline/curated/`:

- `models-2026.csv`: the 40 models, their 2025 sales and body type.
- `trims-2026.csv`: one row per trim and drivetrain, with the MSRP before
  destination, the destination fee, seats where known, a `source_url` and the
  date it was `checked_on`. The `notes` column flags rows worth re-checking
  and is never published.

To change a price, edit `trims-2026.csv` and run `npm run pipeline`, which is
offline and free. A test (`pipeline/tests/curatedCatalog.test.ts`) fails if
the files would not pass validation, so a bad edit is caught in review before
it reaches the site.

The model page links each price to its source. "Prices updated on" in the
footer is the **oldest** `checked_on` date, so no price looks fresher than it is.

Missing for now: fuel economy (EPA) and safety ratings (NHTSA). Both are
free, but their adapters are still stubs and this project's cloud environment
can't reach fueleconomy.gov or api.nhtsa.gov yet. Their filters and table
columns stay hidden until the data exists. Some pickup trims have no seat
count, so those trims show no seat count.

The published files are:

- `index.json`: one slim record per model with everything the results grid
  needs to filter, sort and draw a card. Loaded on first visit.
- `models/{id}.json`: the full record for one model, loaded when its page
  opens, including destination fees and price sources.

Both carry an `updatedAt` date (shown as "Prices updated on ...") and a
`version` stamp, used so a fresh index is never mixed with a stale cached model file.

### Paid sources stay behind a guard

**Project rule: no paid API is called until Jeff has approved the estimated
cost.**

The CarAPI, EPA and NHTSA adapters in `pipeline/sources/` are stubs behind
small interfaces (`CatalogSource`, `FuelEconomySource`, `SafetySource`). Each
one refuses to run unless `WHEELHOUSE_COST_APPROVED=yes` is set, and a test
checks this. The curated catalog only reads local files, so it needs no
approval.

## How filtering works

Filters apply to **trims**, not models. A model shows up when at least one of
its trims passes every active filter, and its card features the cheapest
trim that does. If that isn't the base trim, the card says so: "Available on
the EX AWD trim, $34,000". So an AWD filter never hides a model just because
its cheapest trim is front-wheel drive.

Filters live in the URL (`/?body=suv&drive=AWD&sort=range`) so the back button
and shared links keep them.

A filter only appears when some car has data for it. A field we can't source
(towing, cargo) hides its filter instead of showing it half-empty.

## Adding a filter

1. Add the field to `Trim` or `Model` in `shared/carTypes.ts` (and check
   `IndexTrim` keeps it).
2. Fill it in `pipeline/match.ts` (`mergeSources`) and add a range check in
   `pipeline/validate.ts`.
3. Add it to `FilterState` and `trimPassesFilters` in `web/src/data/filters.ts`,
   with a test in `filters.test.ts`.
4. Give it a URL name in `web/src/data/filterUrl.ts` and a chip label in
   `web/src/data/activeFilters.ts`.
5. Add the control in `web/src/components/FilterPanel.tsx`, behind an
   `available.has...` check from `filterOptions.ts`.

## Hosting

The site is hosted on **Cloudflare Workers, free plan**, as static files
only (no server code). Cloudflare builds the site from GitHub on every push
to `main` and serves `web/dist`.

Two files in the repo set it up:

- **`wrangler.jsonc`** runs `npm run build` before every deploy, tells
  Cloudflare where the built files are and turns on single-page-app mode. Pages such as `/cars/toyota-camry-2026` exist only
  in the browser, so any path that isn't a real file gets `index.html`.
- **`public/_headers`** sets how long browsers keep each file: hashed
  `/assets/` forever, `/data/index.json` for 5 minutes, model files for a day
  (their URLs change every month anyway).

`web/src/hostingConfig.test.ts` fails if either setting is lost.

### Free plan limits (checked 2026-10-27)

- 3,000 build minutes a month, one build at a time, 20 minutes each at most.
  A build here takes well under a minute.
- Requests and bandwidth for static files are free and unlimited.

Sources: [build limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/),
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[SPA mode](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/),
[headers](https://developers.cloudflare.com/workers/static-assets/headers/).

### Connecting the repo (one time, in your own Cloudflare account)

1. Sign in or sign up (free) at https://dash.cloudflare.com.
2. Go to **Workers & Pages**, then **Create**, then **Import a repository**,
   and connect GitHub with access to `jeffreysford2/wheelhouse` only.
3. Name the Worker `wheelhouse` (it must match `name` in `wrangler.jsonc`).
4. Under the Worker's **Settings > Build**, set:
   - Build command: leave empty (`wrangler.jsonc` runs the build)
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
   - Build variable: `NODE_VERSION` = `22`
5. Push to `main` (or press **Retry deployment**). The site goes live at
   `https://wheelhouse.<your-subdomain>.workers.dev`.
