#!/usr/bin/env node
/**
 * build-preview.cjs
 * ------------------------------------------------------------------
 * This is a TEMPORARY dev convenience, not the app's architecture.
 * It exists only because this sandbox cannot run `npm install`/Vite.
 *
 * It mechanically concatenates the real src/ ES modules (unchanged,
 * exactly as Vite would consume them) into one script, stripping
 * import/export syntax so plain Babel-in-browser can run it without
 * a bundler. Delete this whole file once you run the project with
 * real Vite (`npm install && npm run dev`) — src/ needs no changes.
 * ------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");

// Explicit load order: dependencies before dependents.
const FILES = [
  "data/models.js",
  "data/store.js",
  "utils/calculations.js",
  "utils/quickEntry.js",
  "hooks/useStore.js",
  "components/ui/Primitives.jsx",
  "components/ui/Overlays.jsx",
  "components/ui/Feedback.jsx",
  "features/Shell/Shell.jsx",
  "features/Shell/AddMoneyModal.jsx",
  "features/Shell/StartNewMonthModal.jsx",
  "features/Shell/Onboarding.jsx",
  "features/Shell/More.jsx",
  "features/Shell/Help.jsx",
  "features/Challenges/SaveOneMillion.jsx",
  "features/Home/Home.jsx",
  "features/Budget/Budget.jsx",
  "features/Money/Money.jsx",
  "features/Goals/Goals.jsx",
  "features/Insurance/Insurance.jsx",
  "features/Investments/Investments.jsx",
  "features/Debt/Debt.jsx",
  "features/NetWorth/NetWorth.jsx",
  "features/Insights/Insights.jsx",
  "features/Challenges/Challenges.jsx",
  "features/RoastMe/RoastMe.jsx",
  "features/MoneyNotes/MoneyNotes.jsx",
  "features/Settings/Settings.jsx",
  "features/History/History.jsx",
  "App.jsx",
];

function stripModuleSyntax(code, file) {
  // Remove single-line import statements (our convention: one import per line).
  code = code.replace(/^import .*\n/gm, "");
  // Named exports -> plain declarations.
  code = code.replace(/^export const /gm, "const ");
  code = code.replace(/^export function /gm, "function ");
  code = code.replace(/^export default function /gm, "function ");
  // Default-export a component whose declaration was already named above.
  code = code.replace(/^export default /gm, "");
  return `\n/* ---- ${file} ---- */\n` + code;
}

let bundle = `"use strict";\nconst { useState, useEffect } = React;\n`;
for (const f of FILES) {
  const full = path.join(SRC, f);
  const code = fs.readFileSync(full, "utf8");
  bundle += stripModuleSyntax(code, f);
}
// Mount
bundle += `
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
`;

const outDir = path.join(ROOT, "preview");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "app.jsx"), bundle);

const tokens = fs.readFileSync(path.join(SRC, "styles/tokens.css"), "utf8");
const components = fs.readFileSync(path.join(SRC, "styles/components.css"), "utf8");
fs.writeFileSync(path.join(outDir, "styles.css"), tokens + "\n" + components);

const faviconSvg = fs.readFileSync(path.join(ROOT, "public/favicon.svg"), "utf8");
const faviconDataUri = "data:image/svg+xml;base64," + Buffer.from(faviconSvg).toString("base64");

function page(scriptTag) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/svg+xml" href="${faviconDataUri}" />
<meta name="theme-color" content="#69445F" />
<title>Tabbi (browser preview)</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&family=Caveat:wght@500;600&display=swap" rel="stylesheet" />
<style>${tokens}\n${components}</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js" crossorigin></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js" crossorigin></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js" crossorigin></script>
</head>
<body>
<div id="root"></div>
${scriptTag}
</body>
</html>
`;
}

// Linked version (references ./app.jsx — easy to re-run after editing app.jsx directly).
fs.writeFileSync(path.join(outDir, "index.html"), page(`<script type="text/babel" data-presets="react" src="./app.jsx"></script>`));

// Fully self-contained single-file version — safe to share/open on its own.
const inlineScript = `<script type="text/babel" data-presets="react">\n${bundle}\n</script>`;
fs.writeFileSync(path.join(outDir, "tabbi-preview.html"), page(inlineScript));

console.log("Preview built at /preview:");
console.log("  - preview/index.html + app.jsx + styles.css (linked, easy to tweak)");
console.log("  - preview/tabbi-preview.html (single self-contained file, easiest to open/share)");
console.log("This is a dev-only convenience — src/ remains a clean, unmodified Vite project.");
