# Kbd

Kbd shows a key of the keyboard as a small cap in the mono face.

## Markup
`<kbd class="tray-kbd">K</kbd>`: 26px tall with 4px corners, on the resting fill of its ground. Wrap a combination in `<span class="tray-keys">`, one cap per key, with no plus signs between them. Write keys the way they are printed: "Ctrl", "Shift", "Enter", "Esc", and the arrow keys as words.

## Use
- Beside a menu item or in a tooltip, to teach a shortcut.
- In a search field, to show the key that focuses it.
- In help text: "Press <kbd>Esc</kbd> to close".

## Do and don't
- Do show the shortcut for the platform the person is on.
- Don't use it for anything that is not a key (no version numbers, no codes).
- Don't make a key cap clickable.
