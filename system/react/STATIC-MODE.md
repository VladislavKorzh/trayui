# Static mode: React to static HTML that bundle.js brings to life

A page written once with `trayui-react` can also ship as plain HTML that the system's own `bundle.js` makes work, with no React in the browser. This note says how static mode switches on, why it never wires anything twice, what each component writes in it, and how the tests keep it true.

## 1. What it is for, and what stood in the way

`renderToStaticMarkup` already turns any React tree into HTML. Most components then work with `bundle.js` as they are, because they write the `data-tray` markup the plain-HTML system's behaviours read (Select, Combobox, Date Picker, the menus, Tooltip and others), or because the browser does the work (`<details>`, checkboxes, radios). Some components, though, keep their behaviour in React: their handlers and state do what a `bundle.js` behaviour does in plain HTML, and a static render of them is dead.

A survey of every React preview (109) rendered to static HTML, each control pressed in React, in the static page with `bundle.js` and in the static page without it, sorted every difference into one of four kinds:

- **K1**: a `bundle.js` behaviour exists, but React did not write its `data-tray` token or the markup it reads. Static mode fixes it in `trayui-react`.
- **K2**: the state lives in a DOM property or a method, not an attribute, so markup could not carry it. `src/js` had to change too, to read an attribute as the page loads.
- **K3**: the plain-HTML system has no behaviour for it. It is the page's own script's to do (section 5).
- **Preview state**: text or state the preview itself computes in React (a total, "Chosen: Print labels"). It is no gap in the component; a static page's own script keeps it.

K1 and K2 were 16 components: Tabs, Checkbox (K2), Input Group, Auth Form, Dialog, Alert Dialog, Sheet, Drawer, Sidebar, App Shell, Filter Bar, Chart, Toggle, Calendar, Notification Center and File Upload, and a modal dialog open at load (K2) with the dialogs. Each now writes the plain-HTML system's markup in static mode (section 4). A second run of the survey on the static-mode render found every gap left in them to be preview state, K3, or a chart's drawing.

## 2. Switching it on

**A helper on its own entry, `renderToStaticHTML(node, options?)` from `trayui-react/static`, over a context that only it provides.**

```tsx
import { renderToStaticHTML } from 'trayui-react/static';
const body = renderToStaticHTML(<Page />, { identifierPrefix: 'p1-' });
```

- `src/lib/static.ts` holds `StaticMode`, a React context whose default is `false`, and `useStaticMode()`. A component reads it and writes its plain-HTML markup only when it is `true`. With it `false`, every component renders what it rendered before: the 109 previews render byte for byte as before, and so do the ids React makes inside a dialog, which no preview shows (a `useId` added for static mode had shifted them, and was taken out).
- `src/static.ts` is the entry. It wraps the tree in the provider and calls `react-dom/server`'s `renderToStaticMarkup`. So `react-dom/server` stays out of the main entry: `scripts/server.mjs` fails any other module that imports it, and `scripts/packed.mjs` imports the packed entry in Node, renders Tabs with it and without it, and checks what Chart writes and refuses.
- The provider is not exported. The only way into static mode is a render whose output React itself says cannot be hydrated, and in which no effect and no event handler ever runs.
- `src/lib/static.ts` also holds `StaticChipLabels`, a context only Filter Bar provides, in static mode only, so the check items of its menus can write their chip words without a new prop on the public `MenuItem` type.

Rejected:

- **An exported `<StaticMode>` provider.** It could be mounted in a live tree, where React's handlers and `bundle.js` would both answer the same press.
- **A build-time flag** (`process.env.TRAYUI_STATIC`). `dist/` is compiled once for everyone; a consumer's bundler would have to define it, which Vite does not by default; and one build could not render both kinds of page.
- **A prop on each component.** It grows the public API of 108 components for one build step.

## 3. No double wiring

- **In a static page `bundle.js` is the only owner.** `renderToStaticMarkup` runs no effect, so `useBehaviour` never calls the runtime, and it writes no event handler. What the components' state shows first is what the page shows; after that `bundle.js` owns it.
- **In a hydrated tree static mode is never on**, so the static-mode tokens are never written there, and neither `bundle.js` nor `useBehaviour` finds anything to wire that React already handles.
- **Tokens written in both modes** (`menu`, `popover`, `secret`, `dropzone` and the rest already shared) are wired once even when the React package's runtime and a `bundle.js` script are on the same page: both copies of `UI.init` mark each element they wire (`el.__tray[name]`) and skip an element already marked. Read from the code, not tested with the two on one page.
- **The rule for each change:** write the token only when `useStaticMode()` is true. Never write it in the default mode beside a React handler that does the same job. Every change below follows it.
- **What this does not stop:** someone passing the static HTML to `hydrateRoot`. React's documentation says that output cannot be hydrated, and the README says it is never hydrated. There is no runtime guard.

## 4. What each component writes

Each row was built against the plain-HTML preview's markup (`project/components/<Name>/preview.html`) and passes the static parity check (section 6). A cell named in the last column differs only through the preview's own React state, and is excused there.

| Component | Static output | `src/js` | Parity check |
| --- | --- | --- | --- |
| Tabs | `data-tray="tabs"` on the wrapper of the panels form. The navigation form is links and needs nothing; `data-tray="strip"` was written already. | None. | 21 checks; "Controlled" is preview state. |
| Checkbox (K2) | `data-indeterminate` on the `<input>` of a box with `indeterminate`. | `20-forms.js`: `UI.upgrade('input[type="checkbox"][data-indeterminate]')` sets `input.indeterminate = true` once; the first `change` takes the attribute away. Plain-HTML test: `Checkbox.test_data_indeterminate`. | 10 checks; "SelectAll" is preview state. |
| Input Group, Auth Form | `data-tray="reveal"` on the "Show password" button. Auth Form draws its password through Input Group. | None. | 10 and 13 checks. Auth Form's "Sign in" is excused: a static form is sent as a form is (K3). |
| Dialog, Alert Dialog, Sheet, Drawer | All four go through `lib/overlays.tsx`. The `<dialog>` gets an `id` (the one given, or its title's id with `-dialog` after it) and `data-tray="dialog"`; the trigger `data-tray="open"` and `data-target="#<id>"`, and `data-modal="false"` when `modal={false}`. A modal dialog open at first gets `data-open`, never the `open` attribute, as `showModal()` refuses a dialog already open. | `50-overlays.js` (K2): a `<dialog data-tray="dialog" data-open>` is opened with `showModal()` as the page loads, and the attribute goes when it closes; an alert dialog opened that way starts on the safe choice, as one opened by its trigger does. Plain-HTML tests: `Dialog.test_data_open`, `AlertDialog.test_data_open`. | 19, 15, 18 and 14 checks, with test pages for a dialog and an alert dialog open at load (focus at load as in React). Dialog's "Controlled" is preview state. |
| API Keys (the new-key dialog) | Its dialog is a Dialog, so it gets the above; "I have copied it" also gets `data-close`. In static the button closes the dialog without copying the key first. By the code, not tried: Escape closes it too, where React keeps it until the key is copied. | None. | 18 checks, with a test page of the dialog over the page. The NewKey preview passes no `onNewKeyDone`, so React keeps its dialog: that press is excused. |
| Sidebar | `data-tray="sidebar-toggle"` on the collapse button; its `aria-controls`, the sidebar's `id` and `data-collapsed` were written already. | None. | 19 checks; "CollapsedRail" is preview state. |
| App Shell | In the top bar (`TopBar.tsx`): the collapse button gets `data-tray="sidebar-toggle"`, the phone's menu button `data-tray="sidebar-sheet"` and `aria-controls` naming the sidebar. | None. | 37 checks, with a test page at 390px. There the two sheets differ by design: React opens a Sheet titled "Menu" around a copy of the sidebar; the behaviour moves the sidebar itself into a sheet named after it, at the end of the page. `AppShell.test_parity_static_phone_sheet` checks what must match (a modal sheet, the same links, focus inside, Escape back to the menu button, nothing without `bundle.js`): 5 checks. "CollapsedSidebar" is preview state. |
| Filter Bar | `data-tray="filterbar"` on the bar; each check item's chip words as `data-label`; "Clear all" with `data-filter="clear"`, always written in static, as the row of chips hides itself while it holds none. The chips and the items' `data-value` were written already. | None. | 23 checks, adding and removing chips from the menus included; "Controlled" is preview state. |
| Chart | `<figure class="tray-chart" data-tray="chart" data-chart="…">`, its title as `<figcaption class="tray-chart__title">` and its caption as `<p class="tray-chart__caption">`. `data-chart` holds `TrayUI.chart`'s configuration from the same props, which match its fields one for one; the figures table is turned off for a donut, a radial of several rings and ranked bars, which the React chart does not table; missing values are 0; the summary is the one the React chart says. It refuses, with an error that names the chart and says why: a type other than the six, a radial of more than three rings, a stacked line, a value that is not a number or is below zero, no series, and any chart composed in `ChartContainer`. | None. | 12 checks, the drawing compared by its name only: figure names, captions, summaries, legends, keys and figures tables are compared whole. The refusals and the JSON are checked in Node on the packed package. |
| Toggle | `data-tray="toggle"` on the button. | None. | 11 checks; "Controlled" is preview state. |
| Calendar | `data-tray="calendar"` on the empty root, with the options the behaviour reads, written only where they differ from its defaults: `data-mode`, `data-months`, `data-week-start`, `data-locale`, `data-prev-label`, `data-next-label`, `data-today`, `data-min`, `data-max`, `data-month`, `data-value`. Pass `today`, so a build gives the same page on any day. | None. | 22 checks, picking days included; "Controlled" is preview state. |
| Notification Center | `data-tray="notices"` on the panel, `data-notices-count` on the bell's pip, `data-notices="read-all"` on its button, the view radios named `notices-view`, and both the list of every notification and the empty line (`data-notices="empty" hidden`), where React writes one or the other. | None. | 14 checks, "Mark all as read" and the Unread view included; "KeepingTheCount" is preview state. |
| File Upload | On the tray, `data-list` naming the list, `data-max-mb` and, when it is not the default, `data-too-large`; the list is always written, with its id. `bundle.js` then lists the files chosen or dropped and marks one over the limit, where React draws those rows from its events. | None. | `FileUpload.test_parity_static_pick` chooses a small and an 11 MB file: the list and its rows read as in React, the large one is marked, nothing is listed without `bundle.js` (4 checks); the step itself, 5 checks. The Remove and Cancel buttons of files the page starts with are dead in static, as in the plain-HTML system's own preview (K3); "UploadWithProgress" is preview state. |
| Data Table (paging) | Nothing new: it already wrote `data-tray="datatable"`, `data-page-size` and the pager. | None. | 16 checks, with a test page whose pager is among the first controls pressed; "BulkActions" is left out altogether, as the preview writes its button's words from the selection the table reports as it loads. |

Two components need nothing of static mode, because what a static page needs is written in both renders:

- **Navigation Menu with `strip`** writes `tray-tabs` and `data-tray="strip"` on its list in both, so in a static page `bundle.js` fades the strip's end and scrolls the current link, and a link that takes keyboard focus, into view. Tried once on the Strip cell at 390px, with `bundle.js` and without it; Navigation Menu does not opt in to the parity check.
- **A busy Button** (`busy`) gets no handler in a server render, so in a static page the guard `bundle.js` gives every `.tray-btn` makes it ignore presses: a click is cancelled, reaches no listener of the page, and the button keeps focus. Tried once on the busy button of the Button preview; not in the parity check.

Limits these rows share with the plain-HTML system:

- **One Notification Center with a view filter per page.** The radios' name, `notices-view`, is the behaviour's, and radios of one name in one page are one group.
- **A Notification Center with no notifications** shows "Nothing unread." in React; the behaviour hides that line in the All view.
- **An empty File Upload list** is written in static to take the files to come, so it leaves its 12px margin under the tray, where React writes no list until it has a row.

Events: in a static page changes come as `tray:*` events from `bundle.js`, never through the props' callbacks. Some details differ from the props. Tabs report `detail.tab`, the tab's `id` (`<uid>-tab-<i>`), not its `value`.

## 5. What static mode leaves to the page

For K3 there is no plain-HTML behaviour to hand over to. Static mode writes the markup an existing behaviour reads; a new behaviour belongs to the plain-HTML system first, and only if a page written by hand needs it too. A static page's own script does these:

- **Pagination**: in the plain-HTML system pages are pages (links). Render a page per page, or page the rows in your script. The Data Table's own paging (`data-page-size`) works in static.
- **Workspace Switcher**: listen for the menu's `tray:change` and relabel the button, or go to the chosen workspace's page.
- **Form submits** (Auth Form, Invite Form, Message Scroller, Payment Method): the components call `preventDefault` and the `onSubmit` or `onSend` prop; a static form is sent as a form is, to its own address with the fields in the query when it has no `action` and no `method`. Handle `submit` in your script, or give the form an `action` and `method="post"`.
- **Invite Form's error**: listen for the tag input's `tray:change` (`detail.valid`) and clear the field's message.
- **File Upload's existing files**: the dropzone behaviour wires the Remove button only on rows it adds. A small change in `src/js` would cover the rows already in the list, in plain HTML too; it is not part of static mode.

State a preview computes in React (the "preview state" above) is the page's own logic in the same way.

## 6. The parity check

Run by `tools/check.py` through `tools/test_components.py` (the full check, not `--fast`):

- `tests/static.mjs` renders every React preview, and every test page of `tests/static-pages/`, with `renderToStaticHTML` into a folder of the run's own, as `tests/react.mjs` bundles them for React.
- `tests/harness.py` serves it at `/static/<Name>` with the three files (`?bare=1` without `bundle.js`), and adds a step, `STATIC` (`static_parity`), for a component whose test module sets `STATIC = True`:
  - at load, every cell's accessibility tree, and where focus is, are the same in React and in static;
  - after each press (the controls on show in each cell, only those inside a modal dialog while one is open, links only within the page) and an arrow key in each cell, every cell and the focus are the same, and a press that sends one page elsewhere and not the other fails with where it went;
  - a difference already there at load, and left alone by the press, is reported once, on the load;
  - `bundle.js` must be what made them the same at least once (the page without it differs), or the check fails: a component whose behaviour was never tried proves nothing. `STATIC_PROVEN_BY` names the module's own test that shows it, where no press can (choosing files);
  - `STATIC_SKIP = {'Cell': 'why'}` names cells whose own React state a static page leaves to its script: compared at load, not pressed. `'Cell: role "name"'` leaves out one control's press, `'[Page] Cell: role "name"'` on one test page; `STATIC_IGNORE` leaves a cell out, its load too;
  - `STATIC_PAGES = {'Page': width}` adds test pages, `STATIC_FLATTEN = ('img',)` compares those nodes by their name only.
- Test pages (`tests/static-pages/`, not usage examples): `Dialog-open-at-load`, `AlertDialog-open-at-load`, `ApiKeys-new-key`, `AppShell-phone` (390px), `DataTable-paging`.
- 18 components opt in: Tabs, Checkbox, Input Group, Auth Form, Dialog, Alert Dialog, Sheet, Drawer, API Keys, Sidebar, App Shell, Filter Bar, Chart, Toggle, Calendar, Notification Center, Data Table, File Upload.
- With static mode taken out of Tabs and Checkbox, the step fails on both, so it catches a regression.

A plan, not done: the step could turn opt-out, run for every component with a React preview unless the module says `STATIC = False` and why, so that a new React component with a behaviour cannot ship without its static markup. It would add the step to about ninety more components, from 13 s to a minute each.

## 7. Risks

- **Markup a behaviour reads beyond its token.** Several behaviours read ids, `data-value`, class names or `aria-controls`; each change was read against its behaviour and its plain-HTML preview, and the check sees only what the previews and the test pages exercise.
- **Ids.** `useId` ids depend on the tree's shape. A page's script must not hard-code them; several trees in one page need `identifierPrefix`.
- **Callbacks become events.** Code written against `onChange` gets `tray:change` with another detail in a static page.
- **A controlled component becomes uncontrolled.** In React a value may live in a parent's state; in static `bundle.js` owns it after the first render, and anything computed from it is the page's script's.
- **Hydrating static output** would wire twice. It is documented, not guarded.
- **Two copies of `lib/static`.** Static mode is on only when the provider and the components share one `StaticMode` context. Both entries import the same `dist/lib/static.js`, so one copy of the package has one context; two copies of the package (a duplicated install), or a bundler that splits the module in two, would leave static mode off with no error. A build should check that its output carries `data-tray` where it has a component with a behaviour.
- **A password in the address.** A static Auth Form has no handler and no `method`, so pressing "Sign in" sends the fields by GET, the password in the query. Give the form `method="post"` and an `action`, or stop the submit in the page's script.
- **Tabs with nothing chosen.** When `value` names no tab, React shows no tab chosen; `bundle.js` chooses the first at load. Read from the code, not tested.
- **API Keys' new key** can be closed in static without being copied (section 4).
- **Charts:** what `TrayUI.chart` draws is not what Recharts draws, only the same data; a refused chart stops the render, by design.
- **The registry.** `lib/static.ts` is its own registry item (`lib-static`), on which the changed components depend; a shadcn user who installs them gets contexts that are always off.

## 8. Not verified

- Dark and the other themes, right to left, forced colours. The check runs at 1440px in Light; only App Shell's phone page runs at 390px.
- Hover cards, dragging (Resizable is driven only by its arrow keys), dropping files (choosing them is checked), the clipboard (API Keys' copy), Escape on API Keys' new-key dialog.
- What a chart draws: only its name, summary, legend and tables are compared.
- Two Notification Centers with a view filter on one page; a centre with no notifications; Tabs with no tab chosen.
- The two runtimes on one page.
- Navigation Menu's `strip` and a busy Button in a static page beyond the one try each in section 4; neither is in the parity check.
- Expanding a sidebar that starts collapsed: both cells that do it are preview state, so no press of it is left in the check.
- React against React catches flakiness, not a reference that fails the same way twice; the existing component tests and their parity with the plain-HTML previews are the other reference.
- A screen reader.
