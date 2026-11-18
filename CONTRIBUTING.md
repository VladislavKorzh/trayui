# Contributing to Tray UI

Thank you for helping. A bug report with a small example, a fix, a missing component or a clearer sentence in a guide are all welcome.

## Before you start

- **A bug:** open an issue with the smallest markup that shows it, the browser, and what you expected.
- **A new component, variant, block or template:** open an issue first, so we can agree on its shape before you build it. The system is small on purpose: something new should earn its place.
- **A security problem:** do not open an issue. [SECURITY.md](SECURITY.md) says how to report it privately.

## Set up

You need:

- Python 3.12;
- Node 20.19 or later (CI uses 22): the checks build Vite and Next.js apps, which ask for it. The `trayui` CLI itself runs on Node 18;
- Google Chrome, which the browser checks drive through Playwright;
- `ffmpeg`, only to rebuild the media previews.

```sh
git clone https://github.com/VladislavKorzh/trayui.git
cd trayui
python3 -m pip install -r system/requirements.txt
python3 -m playwright install chrome
cd system/react && npm ci && cd ..
```

## Build, look and check

From `system/`:

```sh
python3 tools/build.py      # dist/, the icons, and the React package's generated sources
python3 tools/site.py       # the documentation site, in site/
python3 tools/serve.py      # serve it at http://127.0.0.1:8000
python3 tools/check.py      # every check, as CI runs them; --fast skips the browser
```

`system/README.md` lists every tool and what it looks at.

## Where to make a change

| To change | Edit | Never edit |
| --- | --- | --- |
| A style | `system/src/css/*.css` | `system/dist/` |
| A behaviour | `system/src/js/*.js` | `system/dist/`, `system/react/src/runtime.ts` |
| A token or a theme | `system/project/tokens.json` (themes after Light and Dark: `system/tools/themes.py`) | `tokens.css` |
| An icon | the list in `system/tools/lucide.py`, then run it | `system/src/icons.json` by hand |
| A component | `system/project/components/<Name>/preview.html` and `README.md`, its React twin in `system/react/src/components/`, `system/react/previews/` and `system/react/docs/`, and its test, `system/tests/components/<Name>.py` (a component without one fails `test_components.py`) | |
| A block | `system/project/blocks/<name>.html` | `system/dist/blocks/` |
| A template | `system/project/templates/<name>.html` | `system/dist/templates/` |
| The site | `system/tools/site/` and `system/tools/site.py` | `system/site/` (not kept in git) |

Built files are kept in the repository: `system/dist/`, `system/project/guides/0-components.md`, `5-blocks.md` and `6-templates.md`, `system/project/assets/Icons/`, and `system/react/styles/`, `src/runtime.ts` and `src/icons.ts` (written by `build.py`) and `src/index.ts` (written by `npm run build` in `system/react`). `system/dist/skills/` is written by the site's build. Rebuild with `python3 system/tools/build.py`, `python3 system/tools/site.py` and `npm run build` in `system/react`, and commit what they changed with your change. CI fails when they are out of date.

## How the system is written

- **Every value is a token.** No colour, size, radius or shadow is written inline: a component reads custom properties from `tokens.css`. A new token is a last resort.
- **The markup is the API.** A component is classes (`tray-btn tray-btn--quiet`) and, where it needs a script, a `data-tray` attribute. Its README is its documentation: what it is for, its markup, its variants, and when not to use it.
- **Accessible first.** Native elements before ARIA. Keyboard paths and accessible names are part of a component, not an extra. Text holds 4.5:1 in every theme; `tools/themes.py --check` and the contrast checks measure it.
- **The same component twice.** The plain-HTML component and its React twin render the same markup and classes. A change to one is a change to both.
- **Invented content.** Names, figures, addresses and quotes in examples are invented, and phone numbers use the non-existent `+380 00` code. Never put a real person, company or address in an example.
- **Plain English in the docs.** Short sentences, the active voice, and the thing said once.

## Pull requests

- Keep one change to a pull request, and say what it changes and why.
- Run `python3 system/tools/check.py` before you push.
- A visual change is easier to review with a screenshot, before and after.

## Licence

By contributing you agree that your work is released under the project's [MIT licence](LICENSE). The project follows a [code of conduct](CODE_OF_CONDUCT.md).
