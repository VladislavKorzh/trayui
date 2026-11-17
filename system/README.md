# Tray UI: the design system's source

This folder holds the system and everything built from it. This file is for whoever changes the system or keeps its site: the commands, the conventions and the known limits. The repository's [README](../README.md) is the place to start, and [CONTRIBUTING.md](../CONTRIBUTING.md) explains how to send a change.

| Folder | What |
| --- | --- |
| `project/` | The system as it is written: `README.md` (the brand book), `tokens.json`, `guides/`, `components/<Name>/README.md` and `preview.html`, `blocks/*.html` (whole screens built from the system), `fonts/`, `assets/` (the logo, the icons as single SVG files, the pictures of the media previews). |
| `src/` | What the bundle is built from: `css/*.css`, `js/*.js`, `icons.json`. Edit here, never in `dist/`. |
| `dist/` | Built by `tools/build.py`, and kept in git so the files can be linked from a CDN and downloaded: `tokens.css`, the bundle and the font, ready to link from any project, with the blocks beside them (`dist/blocks/sidebar-01.html` opens as it is), the licences, and the tokens for other tools: `tailwind/` (a Tailwind 4 theme and a Tailwind 3 preset) and `figma/` (Figma variables, one file per theme). |
| `site/` | The documentation site (not kept in git: build it): a home page, the docs and the foundations, a page for every component and every block (blocks shown live in a frame at desktop, tablet and phone width), the Charts section (the React package's chart examples, drawn live by `charts.js`, each with its code), a search, a download of `dist/` and `llms.txt`. Built from `project/` by `tools/site.py`; its own files are in `tools/site/` (`index.html`, `site.css`, `site.js`, `home.html`, `pages/*.md`). Every page has an address of its own (`/components/lightbox`, `/docs/installation`; `route()` in `tools/site.py` gives them) and a file it is drawn in (`components/lightbox.html`, which the host serves at that address), so a link straight to it shows it before any script; moving between pages draws the next one in place, from `pages/<id>.js`, and Back returns to where a page was left. Framed inside another page, where only a `#` reaches it, `index.html` alone shows every page by hash (`#c-lightbox`); a link of that kind on the web lands on the address. `_headers`, `404.html` and `worker.js` (the password door) are for the web host only. |
| `tools/` | The build and the checks. |
| `react/` | **trayui-react**: the same 108 components (plus Icon) as typed React components over the same stylesheet and behaviours, and charts drawn with Recharts from the entry `trayui-react/charts` (`src/charts/`: the `Chart` component and the chart kit). `previews/` holds one usage example per component, `docs/` the guide of each, `examples/charts/` the chart examples the site shows, one file each, listed and ordered in `charts.json`. See its [README](react/README.md). |

```
python3 tools/check.py        everything below that checks, in order, stopping at the first failure: what CI runs
python3 tools/build.py        build dist/, the icons and the React package's generated sources; check tokens, markers and custom properties
python3 tools/themes.py       derive the eight themes after Light and Dark into tokens.json and measure all ten (--check measures only; needs node)
python3 tools/shoot.py        render every preview in Light and Dark (--themes all for every theme); report script errors, overflow and text below 4.5:1
python3 tools/shoot.py --fit  set each preview card's height to what it needs
python3 tools/shoot.py --media forced   render the previews with forced colours (or contrast for more contrast, or print)
python3 tools/smoke.py        drive the previews with a pointer and a keyboard, and check forced colours, more contrast and print (about 150 checks)
python3 tools/feet.py         check that dialog buttons stay on one line at five window widths
python3 tools/pages.py        render every block at 1280, 768 and 390px in Light and Dark (--themes all for every theme); report errors, sideways scroll, low contrast
python3 tools/lucide.py       rewrite src/icons.json from Lucide, as react-icons carries it (after adding a name to its list, or updating react-icons)
python3 tools/media.py        make the pictures and the film the Lightbox and Video Player previews show, from the photographs in tools/media, into project/assets/Media (needs ffmpeg)
python3 tools/play_check.py   render every choice of every playground (tools/site/play/*.json) and report errors, overflow and low contrast
python3 tools/site.py         build site/, the website (bundles the chart examples with node; installs react/ with npm ci the first time)
python3 tools/serve.py        serve site/ at http://127.0.0.1:8000, at its real addresses
python3 tools/site_check.py   open site/ in a browser and check the home page, every page, the search, the playgrounds, the frames, the charts, the themes, the maker of a theme and a theme link, a phone, and the files for Tailwind and Figma
```

Tokens are edited in `project/tokens.json`. A component's preview and guidelines are edited in place under `project/components/<Name>/`. A block is one file, edited in place in `project/blocks/`: the shared `<head>`, a `<title>`, a description and a `tray-category`, then the page; the order of the groups is `BLOCK_GROUPS` in `tools/build.py`. Layout classes for pages are in `src/css/85-layouts.css` and described in `project/guides/4-layouts.md`. `project/guides/0-components.md` and `5-blocks.md` are written by the build. `tools/links.json` holds the version, the published addresses and what the site may say about where it lives: `public` (show links to the repository), `cdn` (the address the three files can be linked from) and `license` (the name of the licence); the site's own pages use them as `{{repo}}`, `{{cdn}}`, `{{license}}`.

Themes: `project/tokens.json` holds ten. Light and Dark were tuned by hand. The other eight are derived from four colours each (the page, the tray, the ink, the accent: the list in `tools/themes.py`) by `tools/site/theme.js`, which places every other colour token at a set contrast with the page and checks 66 rules. The Themes page of the site runs the same file in the browser, so a theme made there follows the same rules. `tokens.css` declares every theme in full and says whether it is light or dark (`color-scheme`), so `data-theme` works on `<html>` and on any element inside any other theme. To add a theme, add a line to `THEMES` and run `tools/themes.py`, then the build.

The logo: `src/logo.svg` is the mark, the same drawing as the favicon. The build copies it to `project/assets/Logos/`; the site draws it inline before its name (`MARK` in `tools/site.py`, the motion in `tools/site/site.css`), and the password door carries its own copy (`tools/site/worker.js`).

Modes: `src/css/95-modes.css` answers more contrast (`prefers-contrast: more`), forced colours and print; `tokens.css` holds the greys a step darker for more contrast and the light values for print, written by the build (`MORE` in `tools/build.py`, and in `tools/site/theme.js` for a theme made on the site).

Tailwind and Figma: `tools/exports.py`, run by the build, writes `dist/tailwind/theme.css` (Tailwind 4: `@theme inline reference`, so each utility reads the system's custom property), `dist/tailwind/preset.cjs` (Tailwind 3) and `dist/figma/` (Design Tokens files Figma imports: one per theme for the colours, one for the scale).

Playgrounds: a component's page shows one when `tools/site/play/<Name>.json` exists; `tools/site/playground.js` says what the file holds and draws it. A theme made on the Themes page travels as a link, `/docs/themes?theme=…`, that holds its colours.

Icons: the system's icons are Lucide's. `tools/lucide.py` holds the list of the ones built into the sprite, by Lucide's names, and writes `src/icons.json` from the copy of `react-icons` in `react/node_modules`, so the sprite and `react-icons/lu` are the same drawings. The stylesheet shows them at 20px with a 2px stroke (`.tray-icon`). In React every `icon` prop takes a built-in name or an element from `react-icons/lu` (`IconSource`, `react/src/lib/icon.ts`).

Charts: in plain HTML the system draws its own (`TrayUI.chart`, `src/js/60-data.js`). In React they are Recharts charts: the rules that restyle what Recharts draws are in `src/css/60-data.css` (from `.tray-chart__canvas` down), the components in `react/src/charts/`. To add an example to the site, add a `.tsx` file to `react/examples/charts/` and a line to `charts.json` there; `cd react && npm run check` type-checks the examples.

To use the system in a project, copy `dist/` and link `tokens.css`, then `components/bundle.css`, then `components/bundle.js`; `project/guides/2-behaviour.md` lists the behaviours.

## Known limits of the page layouts

Found while building the blocks, and not fixed:

- A sidebar with `tray-sidebar--flyout`, and the rail of a collapsed sidebar, cannot scroll: their menus and tooltips must be able to leave them. Floating panels are placed by CSS alone, so nothing flips or shifts a panel that would leave the window, and `tray-pop--side` does not combine with `tray-pop--top`.
- A row menu inside `tray-table-wrap` is framed by the scroll box: the last rows open upwards, and with one row left the menu is cut.
- Stepper: a name that wraps drops its mark by a few pixels.
- Message Scroller does not pin to the end again when text reflows after the font loads.
- The Navigation Menu preview and the React `NavigationMenu` still use the links without `tray-nav__strip`; the article and journal blocks use it.
- There is no product card, product grid or gallery: the catalogue and shop blocks build cards from `tray-feature` (its end row pins the price), lay them out with `tray-integrations` (four, two and one columns), and make the thumbnails of a gallery from choice cards. The bento has no step between its columns and one, so a grid of cards stacks at full width below 56rem.
- A filter column on a public page borrows the app shell (`tray-app--end`, `tray-app__side`, the sidebar sheet on a phone).
- Slider: `data-unit` only goes after the number, so "$120" is written by the page's own script. Stepper: `data-max` is read once, so a limit cannot change with the size chosen.
- `tray-with-aside` puts the side column after the content below 64rem, so contents or key facts come last on a phone; article-01 uses the bento to put its contents first.
- `tray-accordion__body` is 60ch wide at most, also when it holds a list rather than text.
- A `span` in a sidebar item stretches, so an avatar there becomes a pill.
- `tray-pagehead__meta` items and `tray-dl dd` are flex: a run of text with a `<time>` in it falls apart unless it is wrapped in one span.
- There is no pull quote, no footnote style and no class for the lines of a diff (the history block uses `hljs-addition` and `hljs-deletion` with a + or − on each line).
- Extra-small buttons are 40px tall, under the 44px of `size-hit`; the content blocks use the small size for tags, sharing and Reply.

## The site, on Cloudflare Workers

`npx wrangler deploy`, from the root of the repository, runs `tools/build.py` and `tools/site.py`, then uploads `site/` to https://trayui.com. `wrangler.jsonc` holds the configuration, and `tools/site/_headers` sets the response headers: the three files and the font may be linked from other sites, the files under `_/` (whose names hold a hash of their content) are kept for a year, and the first address, on workers.dev, is not to be indexed.

A release: set the version in `tools/links.json` and `react/package.json`, name its section in `CHANGELOG.md`, run `python3 tools/check.py`, commit, tag `v<version>` and push. Then publish the two packages, each from its own folder and with your npm account's two-factor check (in a terminal that can open a browser, or with `--otp=<code>`): `cd dist && npm publish --access public` (the package `trayui`, whose `package.json` and README the build writes) and `cd react && npm publish --access public` (`trayui-react`, which checks and builds itself first). jsDelivr serves the new version of `trayui` within minutes, and the site links it once it is deployed again.

The site is open to everyone. To put it behind a password again, `tools/site/worker.js` is the door: add `"main": "system/tools/site/worker.js"` and, under `assets`, `"binding": "ASSETS"` and `"run_worker_first": true` to `wrangler.jsonc`, set the Worker's secret with `npx wrangler secret put SITE_PASSWORD`, then deploy. No password is kept in the repository. `tools/links.json` holds the address the site lives at (`site`), whether the repository is open (`public`: while it is not, the site links neither the repository nor jsDelivr, and its own copies of the three files stand in for the CDN), the CDN address of a release (`cdn`), and the maintainer the pages name (`author`, `author_url`).

For readers that are not people the build writes `robots.txt`, `sitemap.xml` (with the day each page's source last changed in git), `llms.txt` (an index of every page in the form llmstxt.org sets out), `llms-full.txt` (the whole system in one file) and every page as Markdown beside its HTML (`components/button.md`). Each page carries structured data (JSON-LD) and a picture for links, drawn by `tools/og.py` in Chrome and kept in `.cache/og/` between builds.
