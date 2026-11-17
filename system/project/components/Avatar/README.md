# Avatar

An avatar stands for a person or a team: a softly squared tile with a photo or initials.

## Markup
`<span class="tray-avatar">DK</span>`, or with `<img alt="">` inside when the name is written beside it (give the image real alt text when it is not). Sizes: `tray-avatar--xs` 32px, `tray-avatar--sm` 40px, default 48px, `tray-avatar--lg` 64px. Corners are 12px (16px on the large one), never a circle: the system has no round shapes apart from the switch knob and the radio.

The fallback is one or two initials on the resting fill. `tray-avatar--ink` marks the current person; `tray-avatar--accent` is for the product's own voice (an assistant), once per view.

`tray-avatar-group` overlaps avatars with a ring in the colour of the ground; end it with a counter avatar ("+3").

## Accessibility
An avatar of initials is plain text, so a screen reader reads out the letters. When the name is written beside it, add `aria-hidden="true"` so the name is not heard twice. When it stands alone, give it `role="img"` and an `aria-label` with the name, and give a `tray-avatar-group` `role="group"` and an `aria-label` that says who and how many, such as "Packing team, 6 people". `tray-avatar--ink` marks the current person by its fill alone, so say "You" in words too. An avatar that opens something is a `<button class="tray-avatar">` with an `aria-label`, such as "Account: Oksana Franko".

## Do and don't
- Do keep initials to two letters.
- Do put the name next to an avatar whenever there is room; an avatar alone is a guess.
- Don't add a coloured dot for presence; say "Online" in a caption.
- Don't give each person a random colour.
