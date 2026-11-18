# An accessible carousel that keeps focus at its end

A carousel in HTML, CSS and JavaScript: buttons that stop at the ends without losing focus, slide names, no autoplay or a pause, and reduced motion.

The WAI-ARIA Authoring Practices Guide (APG) defines a [carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) as a set of slides shown "by sequentially displaying a subset of one or more slides". The usual faults are small and add up: a Next button that turns off under the keyboard and drops focus, slides with no names, and slides that move on their own. Below is a carousel built on the browser's own scroll, with Tray UI's [Carousel](#c-carousel) as the worked example.

## Start from a scroll

Make the track a row that scrolls sideways and snaps to each slide. The browser then handles swiping, the trackpad and the arrow keys of a focused track, with or without your script.

```css
.carousel-track {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carousel-track > * {
  flex: 0 0 min(78%, 22rem);
  scroll-snap-align: start;
}
@media (prefers-reduced-motion: no-preference) {
  .carousel-track { scroll-behavior: smooth; }
}
```

A slide 78% as wide as the track lets the next one show at the edge, the one sign that there is more. Tray UI uses the same width by default, set by `--tray-slide`. The buttons and the count are additions on top of the scroll; the slides stay readable if the script never runs.

## The markup and the names

The APG gives a carousel these roles:

- the container is a `region` or a `group` with `aria-roledescription="carousel"` and a name;
- each slide has `role="group"`, `aria-roledescription="slide"`, and a name such as "3 of 10";
- the previous and next controls are buttons with names.

```html
<section class="carousel" aria-roledescription="carousel" aria-label="Field notes">
  <div class="carousel-controls">
    <button type="button" class="prev" aria-label="Previous slide">‹</button>
    <button type="button" class="next" aria-label="Next slide">›</button>
    <span class="carousel-count" aria-hidden="true"></span>
  </div>
  <div class="carousel-track" tabindex="0" role="group" aria-label="Slides">
    <div role="group" aria-roledescription="slide" aria-label="1 of 4">…</div>
    <div role="group" aria-roledescription="slide" aria-label="2 of 4">…</div>
    <div role="group" aria-roledescription="slide" aria-label="3 of 4">…</div>
    <div role="group" aria-roledescription="slide" aria-label="4 of 4">…</div>
  </div>
  <p class="visually-hidden" role="status"></p>
</section>
```

A `section` with a name is a region. `aria-roledescription` changes the word a screen reader may use for the role, so a region becomes a "carousel" and a group a "slide". MDN's advice on the attribute is to avoid it except to clarify container roles like these, and to translate its value with the rest of the page: a French page says "diapositive". The slide names are fixed numbers written in the markup: a slide keeps its place in the sequence whatever is on screen.

The track takes `tabindex="0"`, so the keyboard can reach it and scroll it with the arrow keys; as a stop in the Tab order, it gets a name of its own. In Chrome's accessibility tree, the markup above gives a region "Field notes" described as a carousel and four groups named "1 of 4" to "4 of 4", each described as a slide.

## Buttons that stop at the ends

On the last slide, Next has nowhere to go. The obvious move is `next.disabled = true`, and if Next had focus, focus goes with it. In Chrome 157, a focused button that turns disabled leaves `document.activeElement` on the `body`: a second Enter does nothing, and only Tab finds the way back, from the place where the button was. Pressing Next until the end is exactly how a keyboard user gets there.

Two ways out:

1. **Hand focus on first.** Before Next turns off, move focus to Previous, which is now the only way to go. Tray UI does this, and so does the script below.
2. **Use `aria-disabled="true"`.** The button keeps its focus and its place in the Tab order, and is exposed as disabled; your click handler has to ignore it. The APG prefers `aria-disabled` to `disabled` in a related case, the picker button of the slide on show, "because this is a circumstance where screen reader users benefit from the disabled button being included in the page Tab sequence".

The APG also says that activating the previous or next button does not move focus, "so users may easily repetitively activate them". Handing focus on happens only at an end, when the button that had focus can no longer be used.

```js
const root = document.querySelector('.carousel');
const track = root.querySelector('.carousel-track');
const prev = root.querySelector('.prev');
const next = root.querySelector('.next');
const count = root.querySelector('.carousel-count');
const status = root.querySelector('[role="status"]');
const slides = [...track.children];

function edges() {
  const x = Math.abs(track.scrollLeft); // negative under dir="rtl"
  return { start: x < 2, end: x + track.clientWidth > track.scrollWidth - 2 };
}

// The slide in view: the last one at the end, else the one whose start is nearest
function current() {
  if (edges().end) return slides.length - 1;
  const x = Math.abs(track.scrollLeft);
  const gaps = slides.map((s) => Math.abs(Math.abs(s.offsetLeft - slides[0].offsetLeft) - x));
  return gaps.indexOf(Math.min(...gaps));
}

function go(step) {
  const to = slides[Math.min(Math.max(current() + step, 0), slides.length - 1)];
  track.scrollTo({ left: to.offsetLeft - slides[0].offsetLeft }); // smooth or not: the CSS decides
}

// A button that turns off while it has focus hands focus on first
function turnOff(button, off, other) {
  if (off && document.activeElement === button) (other.disabled ? track : other).focus();
  button.disabled = off;
}

function paint() {
  const { start, end } = edges();
  count.textContent = `${current() + 1} / ${slides.length}`;
  turnOff(prev, start, next);
  turnOff(next, end, prev);
}

// Say where the person is once the scroll has settled
let said = current();
track.addEventListener('scrollend', () => {
  const i = current();
  if (i !== said) status.textContent = `Slide ${i + 1} of ${slides.length}`;
  said = i;
});

prev.addEventListener('click', () => go(-1));
next.addEventListener('click', () => go(1));
track.addEventListener('scroll', paint, { passive: true });
paint();
```

- **Read the position from the scroll.** A swipe or an arrow key moves the track without a click, so a counter kept by the buttons would drift. Every value comes from `scrollLeft`.
- **The end is where the scroll stops.** When several slides fit in view, the last one never reaches the start of the track, so the nearest start at the end is an earlier slide. Counting the last slide as current there keeps the count at "4 / 4" and the status line at "Slide 4 of 4" while Next is off.
- **Last resort: the track.** When every slide fits, both buttons turn off, and focus goes to the track.

## Say where the person is

The count beside the buttons is for the eye, and `aria-hidden` keeps it from being read twice. The `role="status"` line, hidden from the eye by the usual visually-hidden class, says "Slide 3 of 4" once a scroll has settled, and only when the slide has changed, so a scroll that ends where it started says nothing. `scrollend` is in Chrome 114, Firefox 109 and Safari 26.2; in older browsers, wait about 120 milliseconds after the last `scroll` event instead, as Tray UI's Lightbox does. As with any live region, the empty status line has to be in the page before its first message; [Toast notifications that screen readers announce](#a-toast-notifications-screen-readers) explains why.

The APG's own carousel puts `aria-live="polite"` on the container of the slides and switches it to `"off"` while the slides rotate. That suits a carousel that shows and hides slides. On a scroll track no slide appears or disappears, so a status line does that job.

## No autoplay, or a way to stop it

WCAG 2.2 success criterion 2.2.2 Pause, Stop, Hide (level A) covers moving content that "(1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content": there must be "a mechanism for the user to pause, stop, or hide it". A carousel that advances by itself is such content. The Understanding document adds that an animation that stops only while it has focus, and restarts when focus moves away, would not count as a "mechanism for the user to pause".

If slides must rotate, the APG asks for:

- a button that stops and starts the rotation, first in the carousel's Tab order, named for what it will do: "Stop slide rotation", then "Start slide rotation";
- rotation that stops when keyboard focus enters the carousel, and does not restart until the person asks;
- rotation that stops while the pointer rests over the carousel.

The APG's example also starts paused when the system asks for reduced motion. The simplest carousel to make accessible has no rotation at all, which is Tray UI's rule: "Nothing moves on its own and nothing auto-advances."

## Reduced motion

A smooth scroll from one slide to the next is motion caused by a press. WCAG 2.3.3 Animation from Interactions (level AAA) asks that such motion can be turned off, and lists the `prefers-reduced-motion` media query as a technique for it. The CSS above makes the scroll smooth only for a person who has not asked for less motion.

`scrollTo()` without a `behavior` follows the track's `scroll-behavior`, so the CSS decides. A script that passes `behavior: 'smooth'` overrides the CSS and has to ask itself, as Tray UI does:

```js
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
track.scrollTo({ left: to.offsetLeft - slides[0].offsetLeft, behavior: calm ? 'auto' : 'smooth' });
```

Under `reduce`, Next in either version moves the track at once: the next slide is in place before the click handler returns.

## The carousel in Tray UI

Tray UI's [Carousel](#c-carousel) is a strip of cards, one or more in view with the next one peeking in, each card usually a link. Its markup is a named list:

```html
<div class="tray-carousel" data-tray="carousel">
  <ul class="tray-carousel__track" role="list" aria-label="Field notes">
    <li class="tray-carousel__slide">…a card…</li>
  </ul>
  <div class="tray-carousel__bar">
    <span class="tray-carousel__count"></span>
    <div class="tray-row tray-row--sm">
      <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-prev aria-label="Previous note">…</button>
      <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-next aria-label="Next note">…</button>
    </div>
  </div>
</div>
```

- The track keeps `role="list"`: without its bullets Safari would no longer announce it as a list. Tab reaches every link in the cards, and the browser scrolls each into view.
- The script gives the track `tabindex="0"`; there, ArrowLeft and ArrowRight move one card, mirrored under `dir="rtl"`.
- The count is written as "2 / 5": the first card in view, and the last once the track can go no further, so with three cards in view it ends on "5 / 5" as Next turns off (since version 0.3.0; 0.2.0 stopped at "3 / 5"). It is plain text, not announced as it changes.
- The buttons step one card and turn off at the ends. A button that turns off with focus hands it to the other button, or to the track, with `TrayUI.rescue()`, which moves focus only when focus is inside the element that is going. This came in version 0.2.0, as "the end of a carousel".
- Under `prefers-reduced-motion: reduce`, the buttons and keys jump to the card.
- Nothing advances on its own.

```js
if (prev && i === 0) rescue(prev, next && !end ? next : track);
if (next && end) rescue(next, prev && i > 0 ? prev : track);
if (prev) prev.disabled = i === 0;
if (next) next.disabled = end;
```

Tray UI's [Lightbox](#c-lightbox), which shows one picture at a time over the page, takes the APG names instead: each picture is a `figure` with `role="group"`, `aria-roledescription="slide"` and a name such as "2 of 6", and a status line gives the position and the caption once the scroll settles. Its `data-of` attribute holds the word between the numbers, in the language of the page.

Both need only the files from [Installation](#d-installation).
