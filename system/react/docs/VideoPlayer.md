---
category: Display
keywords: [video, player, film, media, movie, captions, subtitles, play, full screen]
---
# VideoPlayer

A video player is a film with the system's controls under it: play, the place in the film, captions, sound and full screen.

## Use
```tsx
<VideoPlayer
  src="/media/farm.mp4"
  poster="/media/farm-poster.webp"
  width={1280}
  height={720}
  captions={[{ src: '/media/farm.en.vtt', srclang: 'en', label: 'English' }]}
  caption="From the beds to the counter, in 13 seconds."
/>

<VideoPlayer src="/media/tour.mp4" width={1280} height={720} lazy labels={{ play: 'Відтворити', pause: 'Пауза', of: 'з' }} />
```

## Details
- The video keeps the browser's own controls until the behaviour runs, so it plays without script too; then the bar takes over.
- The large yellow button starts the film and goes away; it comes back when the film ends. A press on the film plays and pauses it.
- The place in the film is the system's slider, read as "0:07 of 0:13". Captions is a toggle, pressed while they show; it is hidden when there are no `captions`. Full screen takes the whole player; on a phone that allows only the video itself, the video.
- `width` and `height` are required: they keep the box's shape before anything loads. `lazy` loads the poster and the film only when the player comes near the window; use it below the first screen.
- `labels` names the controls in the page's language: `start`, `play`, `pause`, `seek`, `captions`, `mute`, `unmute`, `full`, `exit`, and `of` for "0:07 of 0:13".

## Do and don't
- Do give every film with speech captions, and say in the `caption` how long it is.
- Don't start a film on its own with sound. If a muted film must play on its own, stop it for a visitor who asks for reduced motion.
- Don't put text over the film; the captions need the space.
