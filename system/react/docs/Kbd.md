---
category: Display
keywords: [kbd, keyboard, shortcut, key]
---
# Kbd

Kbd shows a key of the keyboard as a small cap in the mono face.

## Use
```tsx
<Kbd>Esc</Kbd>
<Kbd keys={['Ctrl', 'K']} />           {/* a combination: one cap per key, no plus signs */}
<p>Press <Kbd>/</Kbd> to search.</p>
```

Use it beside a menu item, in a tooltip, in a search field to show the key that focuses it, and in help text.

## Do and don't
- Do write keys as they are printed: "Ctrl", "Shift", "Enter", "Esc".
- Don't use it for anything that is not a key.
- Don't make a key cap clickable.
