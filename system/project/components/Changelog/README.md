# Changelog

The changelog tells people what changed in the product: one entry per release, the date at the start edge, a title, a tag for the kind of change, and a short list.

## Markup
```html
<ol class="tray-changelog">
  <li class="tray-release">
    <div class="tray-release__meta">
      <time datetime="2026-11-12">12 November 2026</time>
      <span class="tray-badge">Version 3.4</span>
    </div>
    <div class="tray-release__body">
      <div class="tray-release__tags"><span class="tray-badge tray-badge--accent">New</span></div>
      <h3 class="subtitle">Courier labels in one click</h3>
      <p>Open an order and press Print: the label comes out with the courier's code on it.</p>
      <ul><li>Works with both label sizes.</li><li>Reprints are counted, not charged.</li></ul>
    </div>
  </li>
</ol>
```
The date and version sit in a 11rem column and move above the entry below 40rem. The tag is a Badge: yellow "New" for the one thing to notice, plain "Improved" and "Fixed" for the rest. At most one yellow tag on a screen.

For "What's new" inside the product, put the latest two entries in a Popover behind a megaphone button with a `tray-pip` on it, and link to the full page.

## Do and don't
- Do write the title as what the person can do now.
- Do date every entry and keep them newest first.
- Don't list internal work nobody can see.
- Don't announce what is not out yet.
