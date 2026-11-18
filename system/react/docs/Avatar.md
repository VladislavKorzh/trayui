---
category: Display
keywords: [avatar, user, person, initials, profile picture]
---
# Avatar

An avatar stands for a person or a team: a softly squared tile with a photo or initials.

## Use
```tsx
<Avatar initials="DK" />
<Avatar src="/people/dana.jpg" />                    {/* alt stays empty when the name is beside it */}
<Avatar size="sm" tone="ink" initials="OF" label="Oksana Franko, you" />
<Avatar tone="accent" icon="sparkle" label="Assistant" />

<div className="tray-avatar-group" role="group" aria-label="Packing team, 5 people">  {/* overlapping, ended with a counter */}
  <Avatar initials="AM" /><Avatar initials="BS" /><Avatar tone="ink" initials="+3" />
</div>
```

Sizes: `xs` 32px, `sm` 40px, `md` 48px (default), `lg` 64px.

An avatar without `label` is hidden from screen readers, for the name written beside it. One that stands alone takes `label`, which makes it `role="img"` with that name. Give a group `role="group"` and an `aria-label` that says who and how many, as above.

## Do and don't
- Do put the name next to an avatar whenever there is room.
- Do keep initials to two letters.
- Don't add a coloured dot for presence; say "Online" in a caption.
- Don't give each person a random colour.
