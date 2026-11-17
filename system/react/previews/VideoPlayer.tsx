import { VideoPlayer } from 'trayui-react';

export function WithCaptions() {
  return (
    <VideoPlayer
      src="/media/farm.mp4"
      poster="/media/farm-poster.webp"
      width={1280}
      height={720}
      captions={[{ src: '/media/farm.en.vtt', srclang: 'en', label: 'English' }]}
      caption="From the beds to the counter, in 13 seconds."
    />
  );
}

export function Lazy() {
  return <VideoPlayer src="/media/farm.mp4" width={1280} height={720} lazy caption="Loads only when it comes near the window." />;
}
