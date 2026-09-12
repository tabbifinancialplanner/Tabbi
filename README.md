# Tabbi

A Kenya-first personal finance and budgeting web app.

## Project structure

This is a **standard Vite + React project**. `src/` is real, unmodified
ES-module React source — every file uses normal `import`/`export`, exactly
as Vite expects. There is nothing sandbox-specific inside `src/`.

```
src/
  data/          models.js (shapes/constants), store.js (persistence + CRUD, pub/sub)
  utils/         calculations.js (all financial logic), quickEntry.js (Add Money parser)
  hooks/         useStore.js
  components/ui/ Primitives, Overlays, Feedback — the shared UI kit
  features/      one folder per screen (Home, Budget, Money, Goals, Insurance,
                 Investments, Debt, NetWorth, Insights, Challenges, RoastMe,
                 MoneyNotes, Settings, History, Shell)
  styles/        tokens.css (design system), components.css
  App.jsx, main.jsx
```

## Running it for real (once you have npm access)

```
npm install
npm run dev       # Vite dev server
npm run build     # production build
npm test          # runs tests/calculations.test.js against src/
```

Nothing in `src/` needs to change to do this — that's the point.

## Testing it right now, without npm/Vite

`tools/build-preview.cjs` is a small, dependency-free Node script that
mechanically concatenates the `src/` modules (stripping only the
`import`/`export` keywords) into `preview/`, so it can run in a browser via
in-browser Babel instead of a real bundler. It changes nothing about how
`src/` is written — it's scaffolding for testing in an environment without
package-manager access, not part of the app's architecture.

```
node tools/build-preview.cjs
```

This produces:

- `preview/tabbi-preview.html` — a single self-contained file. Open it
  directly in any browser to try the full app (needs internet, since React,
  Babel, and the fonts load from CDNs).
- `preview/index.html` + `preview/app.jsx` + `preview/styles.css` — the same
  thing split into linked files, handy if you want to tweak the bundle
  directly while testing.

**Delete the whole `tools/` and `preview/` directories once real Vite is
available** — `npm run dev` replaces this completely.

## Financial logic

Every number in the UI is derived from `src/data/store.js` (the single
source of truth — transactions drive budget actuals, account balances,
net worth, insights, and annual totals) via pure functions in
`src/utils/calculations.js`. Run `npm test` (or `node tests/calculations.test.js`)
to check budget math, emergency fund and sinking fund projections, both
debt payoff methods, net worth, and annual rollups.
