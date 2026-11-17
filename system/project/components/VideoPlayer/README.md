# Video Player

A video player is a film with the system's controls under it: play, the place in the film, captions, sound and full screen.

## Markup
```html
<figure class="tray-player" data-tray="player" data-of="of">
  <div class="tray-player__frame">
    <video width="1280" height="720" preload="metadata" poster="farm-poster.webp" playsinline controls>
      <source src="farm.mp4" type="video/mp4">
      <track kind="captions" src="farm.en.vtt" srclang="en" label="English">
    </video>
    <button class="tray-player__big" type="button" data-play aria-label="Play the film">…play icon…</button>
  </div>
  <div class="tray-player__bar">
    <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-play aria-label="Play" data-label-pause="Pause">…play icon…</button>
    <span class="tray-player__time"><span data-now>0:00</span><span class="tray-player__of"> / </span><span data-total>0:13</span></span>
    <input class="tray-slider tray-player__seek" type="range" min="0" max="13.2" step="0.1" value="0" aria-label="Position in the film" data-seek>
    <button class="tray-toggle tray-toggle--icon" type="button" data-captions aria-pressed="false" aria-label="Captions">…captions icon…</button>
    <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-mute aria-label="Mute" data-label-unmute="Turn the sound on">…volume-2 icon…</button>
    <button class="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-full aria-label="Full screen" data-label-exit="Leave full screen">…maximize icon…</button>
  </div>
  <figcaption class="tray-player__caption">From the beds to the counter, in 13 seconds.</figcaption>
</figure>
```
- The video keeps `controls` in the markup: until the behaviour runs, and on a page without script, it plays with the browser's own controls. The behaviour takes them off and shows the bar.
- The large yellow button starts the film and goes away; it comes back when the film ends. A press on the film itself plays and pauses it too.
- The place in the film is the system's slider: drag it, or use the arrow keys on it. Its value reads as "0:07 of 0:13".
- The play and the sound buttons change their names with the state ("Play" and "Pause", "Mute" and "Turn the sound on"): give both names in the markup, in the page's language. Captions is a toggle (the system's, without its own behaviour: the player turns it) with one name, filled in ink while they show; it is hidden when the video has no `<track>`. A track with `default` starts shown.
- Full screen takes the whole player, bar and all, on the ink ground. On a phone that only allows the video itself to go full screen, the video goes, with the phone's own controls.
- On a narrow screen the total time gives its room to the slider.

## You provide
The film, a poster the size of the film, captions in WebVTT, and the `width` and `height` of the film on the `<video>`, so its box keeps its shape before anything loads. Below the first screen, add `loading="lazy"` to the video.

## Accessibility
The bar is the way in for a keyboard: once the behaviour turns the browser's controls off, the `<video>` takes no focus, and every part of the bar is a button or a range with a name. `Enter` or `Space` presses a button, and the arrow keys move the seek slider by its `step`. Focus draws the 3px ink ring on the bar's controls, and the large play button has its own ring 4px out. The `<figcaption>` names the figure, and the captions come from your WebVTT `<track>`: the player only shows and hides them.

## Do and don't
- Do give every film with speech captions, and say in the caption under it how long it is.
- Do keep `preload="metadata"`: the film loads when it is played, not when the page opens.
- Don't start a film on its own with sound. If a muted film must play on its own, stop it for a visitor who asks for reduced motion.
- Don't put text over the film; the captions need the space.
