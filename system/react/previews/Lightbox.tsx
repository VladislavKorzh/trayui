import { Lightbox } from 'trayui-react';

const pictures = [
  { src: '/media/beds.webp', thumb: '/media/beds-thumb.webp', alt: 'Rows of leafy green snail beds on a hillside, each fenced with black net', caption: 'Open-air snail beds on a hillside.', width: 640, height: 415 },
  { src: '/media/snail.webp', thumb: '/media/snail-thumb.webp', alt: 'A brown-striped garden snail crawling along a wet green leaf', caption: 'Snails come out after rain.', width: 640, height: 480 },
  { src: '/media/jar.webp', thumb: '/media/jar-thumb.webp', alt: 'A small jar of black caviar on crushed ice, crackers beside it', caption: 'A small jar kept on crushed ice.', width: 640, height: 480 },
];

export function Gallery() {
  return <Lightbox label="The farm in pictures" pictures={pictures} />;
}

export function LeadPicture() {
  return <Lightbox label="The farm in pictures" lead thumbWidth="15rem" pictures={pictures} />;
}
