# A Bootstrap alternative without a build step

Bootstrap 5.3 and Tray UI side by side: the CDN lines and npm, what each one ships, theming with Sass or custom properties, dark mode, accessibility and size.

Bootstrap and Tray UI both work from a CDN with nothing to compile: a stylesheet, a script, and HTML with classes. They differ in what you can change and where. This page compares Bootstrap 5.3.9, the version [its documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/) installs on 18 November 2026, with Tray UI 0.2.0; Bootstrap's files were taken from jsDelivr and run in Chrome.

## Two pages from a CDN

Bootstrap's quick start puts one stylesheet in the head and one script before `</body>`. The script is the bundle, which includes Popper for positioning dropdowns, popovers and tooltips. Each line carries an `integrity` hash, which changes with every version.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-yEPZ7jP9S0QKiUQ0m3jjsO4ProIW7wvR9gXkI7JOGa2XVsw53Yke2bsdkBbjmmiX" crossorigin="anonymous">
</head>
<body>
  <button class="btn btn-primary" type="button">Pack the orders</button>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.9/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-WyOxWvTyr1QaMPfiPJSv76iReVthorl5uWlFtZPyK0IEB0hGzo9y5Bp9mYanr8Bu" crossorigin="anonymous"></script>
</body>
</html>
```

Tray UI links two stylesheets and one script, in this order: the tokens, the component classes, the behaviours. jsDelivr serves every release of the `trayui` package on npm, and the address names the release.

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/tokens.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.css">
  <script src="https://cdn.jsdelivr.net/npm/trayui@0.2.0/components/bundle.js" defer></script>
</head>
<body>
  <button class="tray-btn" type="button">Pack the orders</button>
</body>
</html>
```

Tray UI publishes no hashes; Bootstrap's download page shows how to make one: `openssl dgst -sha384 -binary file.js | openssl base64 -A`.

### From npm

`npm install bootstrap@5.3.9` brings the compiled files and the Sass source. Bootstrap's docs say that, whatever the package manager, it "will require a Sass compiler and Autoprefixer for a setup that matches our official compiled versions", and that `import bootstrap from 'bootstrap'` loads every plugin onto one object.

`npm install trayui` brings the built files, with the font and the blocks, and nothing to compile. A bundler imports the three files once, at the entry of the app:

```js
import 'trayui/tokens.css';
import 'trayui/components/bundle.css';
import 'trayui/components/bundle.js';
```

## What each one ships

| | Bootstrap 5.3.9 | Tray UI 0.2.0 |
| --- | --- | --- |
| CSS | `bootstrap.min.css`: layout, content, components and utilities. Smaller builds hold the grid, the utilities or Reboot alone. | `tokens.css`: the tokens, the type classes and the font. `components/bundle.css`: the `tray-` classes. |
| JavaScript | `bootstrap.bundle.min.js` with Popper, or `bootstrap.min.js` without it, and an ES module build. | `components/bundle.js`, one classic script that assigns `window.TrayUI`. |
| Icons | None. Bootstrap Icons is a separate library of over 2,078 icons, as SVG files, a sprite or a web font. | 118 Lucide icons, inside `bundle.js` as a sprite. |
| Font | The device's own, `system-ui` first. | Onest, a variable font: `fonts/Onest-Variable.woff2`. |
| Right to left | A second stylesheet, `bootstrap.rtl.min.css`, built with RTLCSS. The docs call the feature experimental. | The same stylesheet, written in logical properties: set `dir="rtl"` on `<html>`. |
| Catalogue | 24 component pages, and sections for forms, layout and utilities. | 108 components, and 64 blocks: whole screens, one HTML file each. |

Bootstrap lists the components that need its JavaScript, from accordions to tooltips; dropdowns, popovers and tooltips need Popper as well. In Tray UI a component with a behaviour carries a `data-tray` attribute, which the script wires when the page has loaded. Buttons, cards, fields, switches and tables need no script, and the accordion is a `<details>` element.

## Markup and behaviour

Both are classes on plain HTML, and both switch a behaviour on with an attribute. The same menu in each:

```html
<!-- Bootstrap 5.3 -->
<div class="dropdown">
  <button class="btn btn-secondary dropdown-toggle" type="button"
          data-bs-toggle="dropdown" aria-expanded="false">Actions</button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Duplicate</a></li>
    <li><a class="dropdown-item" href="#">Archive</a></li>
  </ul>
</div>

<!-- Tray UI -->
<span class="tray-anchor" data-tray="menu">
  <button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Actions</button>
  <div class="tray-pop">
    <div class="tray-list">
      <button type="button" class="tray-option" role="menuitem" data-value="duplicate">
        <span class="tray-option__text">Duplicate</span>
      </button>
      <button type="button" class="tray-option" role="menuitem" data-value="archive">
        <span class="tray-option__text">Archive</span>
      </button>
    </div>
  </div>
</span>
```

Bootstrap's dropdowns are generic on purpose, since they may hold a search field or a login form, so "Bootstrap does not expect (nor automatically add) any of the role and aria- attributes required for true ARIA menus" ([its docs](https://getbootstrap.com/docs/5.3/components/dropdowns/#accessibility)). In Chrome, the Bootstrap menu above sets `aria-expanded`, moves between items with the arrow keys and returns focus to its button on Escape; its list has no role. Tray UI's script writes `role="menu"` on the panel, `aria-haspopup` and `aria-expanded` on the button and `tabindex="-1"` on each item.

Layout differs more. Bootstrap has a utility API, a Sass map that writes classes such as `mt-3`, `d-flex` and `gap-3`. Tray UI has no spacing utilities: layout is `tray-row`, `tray-stack`, `tray-bento` and a few page frames, and their gaps come from tokens.

## Theming: Sass variables and custom properties

Bootstrap is themed at two levels. Its Sass source holds variables and maps marked `!default`: you set `$primary` or `$body-bg` in your own file before importing Bootstrap, then compile. Its compiled CSS also carries custom properties, all prefixed `--bs-`, offered "for real-time customization without the need to recompile Sass".

The two levels reach different things. In the compiled file each button variant declares its own colours from the Sass values: `.btn-primary` sets `--bs-btn-bg: #0d6efd`. Set a new `--bs-primary` and `--bs-primary-rgb` on `:root` and, in Chrome, `.bg-primary` takes the new colour while `.btn-primary` stays blue. A brand colour across every component is a Sass change, and a new colour in `$theme-colors` needs three more maps for light mode and three for dark ([colour modes](https://getbootstrap.com/docs/5.3/customize/color-modes/#adding-theme-colors)).

Tray UI has no Sass. Every colour, size, corner and space is a custom property in `tokens.css`, and each component reads them where it is drawn: a new `--accent` turns `tray-btn` the new colour. A theme is one rule that gives the colour tokens new values.

```css
[data-theme="orchard"] {
  color-scheme: light;
  --page: #fbfdf6;
  --surface: #eef3e2;
  --ink: #16200d;
  --accent: #c6ec5b;
  /* and the steps between the page and the ink */
}
```

The [Themes](#d-themes) page derives the whole rule from four colours and checks its contrast as you type; [A theme from four colours](#a-colour-theme-from-four-colours) explains how. What the tokens leave alone is the design: Tray UI is one design, with flat grey trays and one yellow for the main action, and its tokens retune the colours, the corners and the type while that structure stays.

## Dark mode

Bootstrap added colour modes in 5.3.0. `data-bs-theme="dark"` on `<html>` darkens the whole page, and on any other element that part alone. Light and dark are built in, and a mode of your own is a `[data-bs-theme="blue"]` rule that overrides the variables. The attribute does not follow the system setting by itself: Bootstrap has no colour mode picker yet, and its docs share their own site's toggler script. With Sass, `$color-mode-type: media-query` makes the modes follow `prefers-color-scheme` instead, at the cost of setting a mode on one component.

Tray UI works the same way with its own attribute: `data-theme` on `<html>` or on any element, ten themes, six of them light and four dark. Each theme declares `color-scheme`, so the browser's scrollbars and controls match it. Nothing follows the system setting by itself here either; these three lines do it until the person chooses:

```js
var saved = localStorage.getItem('theme');
var theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
```

Bootstrap's docs advise running their toggler at the top of the page to reduce flicker while it loads, and the same holds for these lines.

## Accessibility

Bootstrap's [accessibility page](https://getbootstrap.com/docs/5.3/getting-started/accessibility/) puts the responsibility plainly: the result "depends in large part on the author's markup, additional styling, and scripting". It warns that some combinations of the default palette may fall below 4.5:1 for text and 3:1 for non-text contrast, and asks authors to test their own uses. It provides `.visually-hidden` and `.visually-hidden-focusable`, and under `prefers-reduced-motion: reduce` most of its transitions stop.

Tray UI writes its rules in the [Accessibility](#g-accessibility) guide and measures its colours: each of the ten themes holds the system's 66 contrast rules. Focus is a 3px ink ring on every ground, and targets for a finger are at least 44px. The stylesheet answers settings of the person's own too. Under `prefers-contrast: more` every grey moves a step towards the ink and trays get an edge; under forced colours an edge is drawn where a fill was; a printed page takes the light values. Bootstrap 5.3.9's compiled CSS has no rule for `prefers-contrast` or `forced-colors`.

A system's rules do not replace a test of your own pages. The changes in Tray UI 0.2.0 were checked in Chrome and its accessibility tree, and none of them in a screen reader.

## File sizes

Measured on 18 November 2026 with gzip at level 9, a KB being 1024 bytes. Bootstrap's files were downloaded from jsDelivr, and their hashes match the ones in its docs; Tray UI's are those of release 0.2.0.

| File | Size | Compressed |
| --- | --- | --- |
| `bootstrap.min.css` | 226.9 KB | 30.2 KB |
| `bootstrap.bundle.min.js` | 78.8 KB | 23.2 KB |
| `tokens.css` | 15.9 KB | 3.0 KB |
| `components/bundle.css` | 197.5 KB | 36.0 KB |
| `components/bundle.js` | 155.1 KB | 42.4 KB |

Bootstrap's two files come to 53.4 KB compressed and Tray UI's three to 81.3 KB, of which the icon sprite is 4.7 KB. Tray UI also loads its font, 82 KB of woff2, where Bootstrap uses the fonts on the device. Bootstrap's Sass route can leave out the parts you do not use; Tray UI always ships its whole stylesheet.

## When Bootstrap is the better choice

- **A design of your own, compiled.** Sass variables, maps, mixins and the utility API let you rebuild Bootstrap into another look and import only the parts you need. Tray UI's tokens retune one design.
- **Utilities in the markup.** Spacing, display and flex utilities lay out a one-off section with no CSS of your own. Tray UI has a fixed set of layout classes.
- **Older browsers.** Bootstrap's browser list reaches back to Chrome 60 and Safari 12. Tray UI targets the current Chrome, Edge, Safari and Firefox, uses `:has()` and dynamic viewport units, and has no fallbacks.
- **Panels that stay in view.** Popper gives Bootstrap's dropdowns "dynamic positioning and viewport detection". Tray UI places its panels with CSS alone, and nothing moves a panel that would leave the window.
- **Packages for frameworks.** Bootstrap's docs send React, Vue and Angular projects to React Bootstrap, BootstrapVueNext, ng-bootstrap and ngx-bootstrap, since its own script and those frameworks may change the same element. Tray UI has a React package and nothing for Vue or Angular.
- **Fewer bytes.** About 28 KB less to download, compressed, and no font file.
- **A site already built on it.** Rewriting screens that work costs more than it gains.

## Moving a page to Tray UI

Start from the nearest [block](#blocks), then swap each part for its component and delete the utilities it replaces.

| Bootstrap | Tray UI |
| --- | --- |
| `btn btn-primary` | `tray-btn`, once per view |
| `btn btn-outline-secondary` | `tray-btn tray-btn--quiet` |
| `card` with `card-body` | `tray-card` |
| `form-label`, `form-control`, `form-text` | `tray-label`, `tray-input` and `tray-field__hint`, inside `tray-field` |
| `vstack gap-3`, `hstack gap-3` | `tray-stack`, `tray-row` |
| `container` | `tray-container` |
| `modal`, opened with `data-bs-toggle="modal"` | `<dialog class="tray-dialog" data-tray="dialog">`, opened by a button with `data-tray="open"` |
| `dropdown` with `data-bs-toggle="dropdown"` | `tray-anchor` with `data-tray="menu"` |
| `data-bs-theme="dark"` | `data-theme="dark"` |

[Installation](#d-installation) has the lines to link and a first screen, [Theming](#d-theming) the tokens that are not colours, and every [component](#components) page a live example with its markup. [Dropdown Menu](#c-dropdown-menu) lists the keys of the menu above, and [Dialog](#c-dialog) how a dialog opens and closes. For markup added after the page has loaded, call `TrayUI.init(root)`.
