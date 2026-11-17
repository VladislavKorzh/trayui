---
category: Onboarding
keywords: [changelog, release notes, what's new, updates, versions, releases, announcements]
---
# Changelog

The changelog tells people what changed in the product: one entry per release, the date at the start edge, a title, a tag for the kind of change, and a short list.

## Use
```tsx
<Changelog
  releases={[
    {
      date: '2026-11-12',                  // shown as "12 November 2026"
      version: 'Version 3.4',
      tags: ['new'],                       // 'new' is yellow; 'improved' and 'fixed' are plain
      title: 'Courier labels in one click',
      description: "Open an order and press Print: the label comes out with the courier's code on it.",
      changes: ['Works with both label sizes.', 'Reprints are counted, not charged.'],
    },
    { date: '2026-10-28', version: 'Version 3.3', tags: ['improved', 'fixed'], title: 'A faster orders page' },
  ]}
/>
```

## Parts
The date and the version sit in an 11rem column at the start edge and move above the entry below 40rem. The body holds the tags, the title in `subtitle` type, an optional sentence and an optional bullet list. Releases are separated by hairlines.

Tags are Badges. Use `'new'` (yellow "New") for the one thing to notice, at most once on a screen, and `'improved'` or `'fixed'` for the rest. For another word, pass `{ label: 'Security' }`.

For "What's new" inside the product, put the latest one or two entries in a Popover behind a megaphone button and link to the full page.

## Do and don't
- Do write the title as what the person can do now.
- Do date every entry and keep them newest first.
- Don't list internal work nobody can see.
- Don't announce what is not out yet.
