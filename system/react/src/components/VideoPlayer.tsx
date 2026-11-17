import * as React from 'react';
import { cx, useBehaviour, useForwardedRef } from '../lib/util';
import { Icon } from './Icon';

export interface VideoCaptions {
  /** The captions, as a WebVTT file. */
  src: string;
  /** The language of the captions: 'en'. */
  srclang: string;
  /** Their name in a menu of the browser's: 'English'. */
  label: string;
  /** Shown from the start. Default false. */
  default?: boolean;
}

export interface VideoPlayerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /** The film. */
  src: string;
  /** Its type, so the browser can tell before it loads it. Default 'video/mp4'. */
  type?: string;
  /** A picture shown before the film plays, the size of the film. */
  poster?: string;
  /** The width and the height of the film in pixels, so its box keeps its shape before anything loads. */
  width: number;
  height: number;
  /** The captions. With none, the Captions button is hidden. */
  captions?: VideoCaptions[];
  /** A line under the film: what it is and how long. */
  caption?: React.ReactNode;
  /** Loads the poster and the film only when the player comes near the window. Use it below the first screen. */
  lazy?: boolean;
  /** The names of the controls, in the page's language. */
  labels?: Partial<Record<'start' | 'play' | 'pause' | 'seek' | 'captions' | 'mute' | 'unmute' | 'full' | 'exit' | 'of', string>>;
}

const LABELS = {
  start: 'Play the film', play: 'Play', pause: 'Pause', seek: 'Position in the film', captions: 'Captions',
  mute: 'Mute', unmute: 'Turn the sound on', full: 'Full screen', exit: 'Leave full screen', of: 'of',
};

/**
 * A video player is a film with the system's controls under it: play, the place in the film, captions, sound and full screen.
 * The video keeps the browser's own controls until the behaviour runs, so it plays without script too.
 */
export const VideoPlayer = React.forwardRef<HTMLElement, VideoPlayerProps>(function VideoPlayer(
  { src, type = 'video/mp4', poster, width, height, captions = [], caption, lazy, labels, className, ...rest },
  forwarded,
) {
  const ref = useForwardedRef(forwarded);
  useBehaviour(ref, [src]);
  const l = { ...LABELS, ...labels };
  const lazyAttr = lazy ? ({ loading: 'lazy' } as React.VideoHTMLAttributes<HTMLVideoElement>) : {};
  return (
    <figure ref={ref as React.RefObject<HTMLElement>} key={src} className={cx('tray-player', className)} data-tray="player" data-of={l.of} {...rest}>
      <div className="tray-player__frame">
        <video width={width} height={height} preload="metadata" poster={poster} playsInline controls {...lazyAttr}>
          <source src={src} type={type} />
          {captions.map((c) => (
            <track key={c.src} kind="captions" src={c.src} srcLang={c.srclang} label={c.label} default={c.default} />
          ))}
        </video>
        <button className="tray-player__big" type="button" data-play="" aria-label={l.start}>
          <Icon name="play" />
        </button>
      </div>
      <div className="tray-player__bar">
        <button className="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-play="" aria-label={l.play} data-label-pause={l.pause}>
          <Icon name="play" />
        </button>
        <span className="tray-player__time">
          <span data-now="">0:00</span>
          <span className="tray-player__of"> / </span>
          <span data-total="">0:00</span>
        </span>
        <input className="tray-slider tray-player__seek" type="range" min={0} max={0} step={0.1} defaultValue={0} aria-label={l.seek} data-seek="" />
        <button className="tray-toggle tray-toggle--icon" type="button" data-captions="" aria-pressed="false" aria-label={l.captions}>
          <Icon name="captions" />
        </button>
        <button className="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-mute="" aria-label={l.mute} data-label-unmute={l.unmute}>
          <Icon name="volume-2" />
        </button>
        <button className="tray-btn tray-btn--quiet tray-btn--sm tray-btn--icon" type="button" data-full="" aria-label={l.full} data-label-exit={l.exit}>
          <Icon name="maximize" />
        </button>
      </div>
      {caption != null && <figcaption className="tray-player__caption">{caption}</figcaption>}
    </figure>
  );
});
VideoPlayer.displayName = 'VideoPlayer';
