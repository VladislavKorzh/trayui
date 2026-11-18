# Grounds and nesting

Depth in this system is fill, and fill alternates. A component never needs to be told its colours; it reads them from the ground it sits on.

## The alternation

| Ground | Class | Controls on it are |
| --- | --- | --- |
| The page (`page`) | none | `surface` grey |
| A tray (`surface`) | `tray-card` | `page` white |
| A white panel inside a tray (`page`) | `tray-panel` | `surface` grey |
| A floating panel (`raised`) | `tray-pop`, `tray-dialog`, `tray-sheet`, `tray-drawer`, `tray-toast`, `tray-command`, `tray-raised` | `surface` grey |
| Yellow (`accent`) | `tray-card--accent`, `tray-alert--accent`, `tray-island` | `paper` white, text `paper-ink` |
| The ink card (`inverse`) | `tray-card--inverse` | `inverse-off`, text `on-inverse` |
| Leaf (`leaf`) | `tray-card--leaf` | `page` |

A filled row (an Item, an Alert, a choice card, a switch row, an attachment) is a small ground of its own: the tile or button inside it takes the colour behind the row. So on the white page an Item is grey and its icon tile is white; inside a tray the Item is white and its tile grey.

## How it works

Four local custom properties carry the ground down the tree. Component styles use these, never a colour token directly, for anything that depends on the ground:

- `--tray-ground`: the colour behind the component.
- `--tray-fill`: the resting fill of a control on that ground.
- `--tray-off`: an unselected ring or an off switch (it is `ink-hint` on `raised`, where `control-off` would be too faint).
- `--tray-on-ink`: text on a solid-ink, selected fill.

When you build something new, use the same four and it will sit correctly on every ground and in every theme.

## Radii step down with nesting

| Level | Token | Examples |
| --- | --- | --- |
| The surface | `radius-card` 40 | card, dialog, sheet |
| A panel on it | `radius-panel` 28 | white panel, popover, media |
| A large control | `radius-button` 20 | large button, the tray of a segmented control or tab strip, menu, alert |
| A field | `radius-input` 16 | input, select, choice card, item, toast |
| A small control | `radius-control` 14 | small button, segment, tab, menu item, day |
| A chip | `radius-chip` 12 | badge, chip, tooltip, avatar, icon tile |

Never give a child a larger radius than its parent, and never put a 40px corner inside a 40px corner: use `tray-panel`.

## Rules

- Do not nest a tray in a tray. Inside a `tray-card` use a `tray-panel`, a hairline, or space.
- One yellow surface and one ink card per screen, at most.
- Do not set a background on a control to "fix" it on an unusual ground; give the ground one of the classes above.
- Yellow keeps the light palette in the dark theme. Put theme-dependent things (a chart drawn in `ink`, a quiet button) on it with care: they will stay light.
