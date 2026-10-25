# Wheelhouse

A research site for new cars sold in the US (model years 2025 and 2026).
Visitors filter every model by what matters to them, open a model to see its
trims, and (soon) compare up to six trims side by side.

There are two separate pieces, and keeping them apart is what keeps the
system simple:

1. **The data pipeline** (`pipeline/`) runs monthly, calls the car data APIs,
   merges and checks the results, and writes static JSON to `public/data/`.
2. **The website** (`web/`) is a React app served as static files. The browser
   downloads the JSON once and does all filtering, sorting and search itself.
   There is no database and no search server.

```
wheelhouse/
  shared/carTypes.ts   the Model and Trim types, used by both pieces
  pipeline/            monthly data job (Node + TypeScript)
    sources/           one adapter per data source (catalog, EPA, NHTSA), currently stubs
    sample/            hand-written sample data for building the site
    match.ts           rules for matching records across sources
    validate.ts        sanity checks before publishing
    build.ts           writes the JSON files
    run.ts             the monthly job itself
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
```

## The data

`public/data/` currently holds **sample data**: 14 hand-written models with
illustrative prices and figures, not checked against any real source. Rebuild
it with `npm run sample-data`, which is fully offline.

The files are:

- `index.json`: one slim record per model with everything the results grid
  needs to filter, sort and draw a card. Loaded on first visit.
- `models/{id}.json`: the full record for one model, loaded when its page opens.

Both carry an `updatedAt` date (shown as "Prices updated on ...") and a
`version` stamp, used so a fresh index is never mixed with a stale cached model file.

### The real pipeline is not wired up yet, on purpose

**Project rule: the pipeline is never run, and no paid API is called, until
Jeff has approved the estimated cost.**

The source adapters in `pipeline/sources/` are stubs behind small interfaces
(`CatalogSource`, `FuelEconomySource`, `SafetySource`). Each one refuses to
run unless `WHEELHOUSE_COST_APPROVED=yes` is set, and a test checks this.
`npm run pipeline --workspace pipeline` today just prints why it stopped.

When Phase 0 picks the data providers, implement the adapters, keep the
guard, and get the cost approved before the first run.

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

Vercel or Netlify, still to be decided. Either way the host needs a rewrite
from every path to `index.html`, because pages like `/cars/toyota-camry-2026`
are handled in the browser.
