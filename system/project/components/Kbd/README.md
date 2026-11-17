# Kbd

Kbd shows a key of the keyboard as a small cap in the mono face.

## Markup
`<kbd class="tray-kbd">K</kbd>`: 26px tall with 4px corners, on the resting fill of its ground. Wrap a combination in `<span class="tray-keys">`, one cap per key, with no plus signs between them. Write keys the way they are printed: "Ctrl", "Shift", "Enter", "Esc", and the arrow keys as words.

## Use
- Beside a menu item or in a tooltip, to teach a shortcut.
- In a search field, to show the key that focuses it.
- In help text: "Press <kbd>Esc</kbd> to close".

## Accessibility
A `<kbd>` is read as its text, and screen readers do not say that it is a key, which is why keys are written as words. Inside a button or a menu item the caps are read as part of its name. The cap only shows a shortcut: it is not focusable, and making the shortcut work is up to you.

## Do and don't
- Do show the shortcut for the platform the person is on.
- Don't use it for anything that is not a key (no version numbers, no codes).
- Don't make a key cap clickable.
