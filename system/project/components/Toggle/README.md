# Toggle

A toggle is one button that stays pressed: on is solid ink, off is the resting fill.

## Use
A single on/off setting that takes effect at once and belongs to a toolbar: bold, pin, mute, show the grid, the theme switch. For a setting in a form or a list of settings, use Switch. For a choice among several options, use Toggle Group.

## Markup
`<button class="tray-toggle" type="button" data-tray="toggle" aria-pressed="false">`. Add `tray-toggle--icon` for an icon-only toggle (with `aria-label`) and `tray-toggle--xs` for the 40px size. It fires `tray:change` with `detail.pressed`.

To swap the icon with the state, give two icons `data-when="off"` and `data-when="on"`: the theme switch shows the moon while light and the sun while dark.

## Accessibility
It is a `<button>` whose `aria-pressed` carries the state, so a screen reader announces it as pressed or not pressed, and `Enter` or `Space` flips it. Its name is its label, or the `aria-label` of an icon-only toggle. Pressed is solid ink, and with forced colours it takes the system's colours for a chosen item. Focus draws the 3px ink ring outside it.

## Do and don't
- Do keep the label the same in both states ("Pin", not "Pin" / "Unpin"); `aria-pressed` carries the state.
- Don't use yellow for the pressed state. Selected is always solid ink.
