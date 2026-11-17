# Button

A button starts an action; the yellow one is the single most important action in view.

## Variants
| Class | Use |
| --- | --- |
| `tray-btn` | Primary: `accent` fill, `on-accent` text. One per view. |
| `tray-btn tray-btn--dark` | Solid `ink`. The main action on a yellow surface, or a second strong action. |
| `tray-btn tray-btn--quiet` | Secondary: grey on white, white on a tray. The default for everything that is not the main action. |
| `tray-btn tray-btn--ghost` | No fill until hover. Toolbars, dialogs, "Cancel". |
| `tray-btn tray-btn--danger` | Deletes or cancels something for good. Never the only way to back out. |
| `tray-btn tray-btn--link` | An action that reads as a link inside text. |

## Sizes
`tray-btn` is 64px (`size-lg`, type `action`). Add `tray-btn--md` (56px, sits in a row with inputs), `tray-btn--sm` (48px, headers and toolbars) or `tray-btn--xs` (40px, tables and dense rows). `tray-btn--icon` makes it square; `tray-btn--block` full width; `tray-btn--split` pushes a value to the far end ("Order a jar … $59").

## You provide
- The label: a verb first, sentence case, no full stop ("Order a jar", "Save changes").
- For an icon-only button, an `aria-label`.
- Use `<a class="tray-btn">` when it goes somewhere, `<button type="button">` when it does something.

## States
Hover darkens the fill slightly, press scales to 0.97, keyboard focus draws a 3px `ink` ring 3px out. A disabled button keeps its fill at `opacity-disabled`. While work is running set `aria-busy="true"` and put a `tray-spinner` before the label; keep the label.

## Do and don't
- Do keep one primary button per view (the One Yellow Rule).
- Don't put two yellow buttons side by side; make the second one quiet.
- Don't use the danger button for a routine "Remove filter".
