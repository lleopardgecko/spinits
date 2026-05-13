# Spin Its

## Overview
Spin Its is an ingredient swap tool — users browse or search for an ingredient and get suggested substitutions grouped by category. It's built for Carla Lalli Music (carlalalli.com), a cookbook author / food media personality, and will live on an **unlisted, password-protected page** on her Squarespace Core site.

## Hosting architecture
The tool is split across two hosts:

- **Squarespace** — hosts the page itself. The tool is embedded via a single Squarespace Code Block (set to HTML type), pasted from `squarespace-codeblock.html`.
- **GitHub Pages** — hosts `ingredients.js` so the ingredient data can be updated independently of Squarespace (push to `main`, GH Pages republishes, the embed picks up the new data on next page load).

Repo: **github.com/lleopardgecko/spinits** (account `lleopardgecko` — not `leo-music`).
Data URL: **https://lleopardgecko.github.io/spinits/ingredients.js**

`ingredients.js` defines a global `GROUPS` variable. It's the only file that needs to be publicly served by GitHub Pages. Everything else in the repo is source / reference.

## Files
- `ingredients.js` — ingredient swap data. **Served via GitHub Pages.** Hand-authored — do not reformat or re-sort.
- `ingredients.json` — JSON version of the same data (used by the React variant). Do not modify.
- `spin-itsTOSEND.html` — full standalone HTML/CSS/JS tool. Source of truth for the Squarespace block.
- `spin-itsTOSEND.jsx` — React component version (reference only, not used for Squarespace).
- `squarespace-codeblock.html` — the adapted version that gets pasted into the Squarespace Code Block. Differs from the standalone in three ways: no document wrapper, loads `ingredients.js` from GH Pages, and all CSS is scoped under `#spinits-app`.

## Squarespace gotchas
- **Test in incognito.** When logged into Squarespace, code blocks sometimes don't render until publish. Always verify in a private window.
- **Disable Ajax loading** on the site if the tool doesn't render on navigation (Settings → Advanced → Site-Wide Ajax Loading). Ajax page transitions can skip script execution inside code blocks.
- **Code block size limit is 400 KB.** `squarespace-codeblock.html` must stay under this.
- Squarespace's own CSS bleeds into code blocks — that's why everything in the embed version is scoped under `#spinits-app`. Don't add unscoped global selectors or a global `*` reset.

## Conventions
- The tool must behave identically to the standalone HTML — same search, browse, swap behavior, and visuals. Visual differences in the Squarespace version are bugs.
- Updating ingredient data: edit `ingredients.js`, commit, push to `main`. GH Pages will redeploy.
- Updating tool logic / styling: edit `spin-itsTOSEND.html` first (source of truth), then re-derive `squarespace-codeblock.html` from it.
