# Carousel

A carousel is one row of cards that scrolls sideways and snaps to each card.

## Markup
```html
<div class="tray-carousel" data-tray="carousel">
  <ul class="tray-carousel__track" aria-label="Field notes">
    <li class="tray-carousel__slide">…a card…</li>
  </ul>
  <div class="tray-carousel__bar">
    <span class="tray-carousel__count"></span>
    <div class="tray-row tray-row--sm">…previous and next buttons with data-prev and data-next…</div>
  </div>
</div>
```
The track is the browser's own scroll with snapping, so swipe, trackpad and keyboard work without script; the behaviour adds the two buttons and the "2 / 5" count. Set the slide width with `--tray-slide` on the track (default: 78% of the track, at most 22rem), so the next card always peeks in.

## Do and don't
- Do let the next slide show at the edge; it is the only hint that there is more.
- Do show the count as numbers, not dots.
- Don't auto-advance. Nothing in the system moves on its own.
- Don't hide content that matters in slide four; a carousel is for browsing, not for must-read steps.
- Prefer a bento of cards when everything fits.
