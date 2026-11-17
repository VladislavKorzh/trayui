# Styles and behaviour

The system ships as three files and needs no framework and no build step.

## Loading

```html
<html lang="en" data-theme="light">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="components/bundle.js" defer></script>
```
`tokens.css` declares every token as a custom property (`--ink`, `--radius-card`, `--space-4`) and a class per type style (`.display`, `.body`). `bundle.css` holds the `tray-` classes and loads after it. `bundle.js` is one classic script that assigns `window.TrayUI`, injects the icon sprite and wires up behaviours; it loads nothing from the network.

Switch themes by setting `data-theme="dark"` on `<html>`. Follow the system setting until the person chooses, then remember their choice.

## Behaviours

A behaviour is attached with `data-tray="name"` on the element named below. Call `TrayUI.init(root)` after adding markup to the page. Most components need none: buttons, cards, fields, checkboxes, radios, switches, accordion, table and tabs-as-links are plain HTML and CSS.

| `data-tray` | On | Does |
| --- | --- | --- |
| `toggle` | a button with `aria-pressed` | flips the pressed state |
| `stepper` | a button group with two `data-step` buttons and an `<output>` | counts between `data-min` and `data-max` |
| `otp` | the row of one-character inputs | advances, steps back, takes a pasted code |
| `slider` | `<input type="range">` | fills the track, writes the value |
| `count` | a textarea with `maxlength` | shows the character count |
| `reveal` | a button in a password group | shows and hides the password |
| `select` | the anchor of a custom select | opens the list, sets the value |
| `combobox` | the anchor of a combobox | filters the list as you type |
| `calendar` | an empty element | draws a month grid; single date or range |
| `datepicker` | the anchor of a date field | ties a calendar to a trigger |
| `tabs` | the wrapper of a tablist and its panels | switches panels, arrow keys |
| `strip` | a tab strip that may overflow | fades its end while it scrolls |
| `menu` | the anchor of a dropdown menu | opens, arrow keys, check and radio items |
| `menubar` | a strip of menus | moves between menus |
| `contextmenu` | a region holding a menu | opens it where the region is right-clicked |
| `popover` | the anchor of a popover | opens a panel, moves focus in and back |
| `hovercard` | the anchor around a link | opens a preview on hover or focus |
| `tooltip` | an anchor around one control, with `data-tip` | names the control on hover and focus |
| `dialog` | a `<dialog>` (dialog, alert dialog, sheet, drawer) | `data-close` buttons, closing on the veil (a press and a release both on it, so a selection dragged out does not close it) |
| `open` | a button with `data-target` | opens that dialog |
| `sidebar-toggle` | a button with `aria-controls` | collapses the sidebar to a rail |
| `sidebar-sheet` | the `tray-app__menu` button, with `aria-controls` | opens that sidebar in a sheet on a small screen |
| `command` | the command panel | filters and runs options |
| `split` | a resizable pair of panes | drags the handle, arrow keys |
| `carousel` | a carousel | previous, next and the count |
| `datatable` | the wrapper of a table | filter, sort, select, page |
| `chart` | a figure with `data-chart` JSON | draws the chart |
| `scroller` | a message scroller | follows new messages, offers "Latest" |
| `reaction` | a reaction button | toggles it and its count |
| `more` | a "Show more" button | opens a clamped bubble |
| `questionnaire` | the questionnaire form | one question at a time |
| `copy` | a button with `data-target` | copies that text, or a field's value; says Copied or Copy failed on the button and through a status beside it |
| `dismiss` | a button inside a block with `data-dismissable` | hides that block |
| `spark` | an element with `data-points` | draws a small trend line |
| `uptime` | an element with `data-days` and `data-incidents` | draws a bar per day |
| `pricing` | the wrapper of a billing-period switch | shows the price of the chosen period |
| `mask` | an input with `data-mask` | groups a card number, writes an expiry date |
| `secret` | the wrapper of a masked key | shows, hides and copies the key |
| `taginput` | the tray of a tag input | turns typed values into chips |
| `dropzone` | the tray of a file upload | takes dropped or chosen files and lists them |
| `checklist` | an onboarding checklist | opens the next task, fills the progress |
| `tour` | the area a tour runs in | shows one step at a time beside its target |
| `feedback` | a feedback form | opens the follow-up, then the thanks |
| `consent` | a cookie consent panel | closes it and reports the choice |
| `notices` | a notification panel | marks as read, counts the unread |
| `filterbar` | a filter bar | keeps the chips and the menu items in step |

## Events

Behaviours report with bubbling custom events on their own element: `tray:change` (a value, a selection, a page, a size), `tray:select` (a menu or command item), `tray:open` and `tray:close` (a floating panel), `tray:complete` (a one-time code, a questionnaire). The value is in `event.detail`.

## Functions

| Function | Use |
| --- | --- |
| `TrayUI.init(root)` | Wire up behaviours under `root` after adding markup. |
| `TrayUI.chart(el, config)` | Draw a chart into a `<figure class="tray-chart">`. Returns `{ update(config) }`. |
| `TrayUI.calendar(el, options)` | Draw a calendar. Returns `{ value(), set(value) }`. |
| `TrayUI.toast(options)` | Show a toast. Returns `{ dismiss() }`. |
| `TrayUI.formatDate(value, locale)` | "14 Nov 2026", or a range. |
| `TrayUI.icon(name, className)` | The markup of an icon. |
| `TrayUI.register(name, fn)` | Add your own `data-tray` behaviour. |
| `TrayUI.upgrade(selector, fn)` | Run `fn` once for every element that matches, with no `data-tray` of its own (the system gives every `.tray-seg` and `.tray-tabs` its sliding pill this way). |

## Motion

Things come in by CSS alone (`@starting-style`); the behaviours help them go away. A panel the behaviours close (a menu, a popover, a listbox, a tooltip, a hover card) is hidden with its exit transition; a dialog the behaviours close leaves first and closes when it has left, Escape included, also where the browser cannot keep it in the top layer while it leaves (there `data-closing` runs the exit first). A toast sinks out and is then taken away. Hiding or closing from your own script works as before, and the panel then goes away at once.

The pill of a segmented control follows its radios' `change` event: after setting a radio from script, dispatch `new Event('change')` on its `.tray-seg`. A strip of tabs or links follows `aria-selected` and `aria-current` by itself.

## Naming

Classes are `tray-block`, `tray-block__part`, `tray-block--variant`. State is in attributes, never in classes: `aria-pressed`, `aria-selected`, `aria-current`, `aria-invalid`, `aria-busy`, `open`, `hidden`, `disabled`, and `data-` attributes for what ARIA has no word for. Local custom properties start with `--tray-`.
