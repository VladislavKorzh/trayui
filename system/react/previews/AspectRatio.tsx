import { AspectRatio, Card } from 'trayui-react';

export function Presets() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 16rem' }}><AspectRatio placeholder="16 / 9" /></div>
      <div style={{ flex: '1 1 9rem' }}><AspectRatio ratio="photo" placeholder="4 / 3" /></div>
      <div style={{ flex: '1 1 7rem' }}><AspectRatio ratio="square" placeholder="1 / 1" /></div>
      <div style={{ flex: '1 1 6rem' }}><AspectRatio ratio="portrait" placeholder="3 / 4" /></div>
    </div>
  );
}

export function InACard() {
  return (
    <div className="tray-bento">
      <Card className="tray-span-7" title="The beds at dawn" description="A banner in any ratio, given as a number.">
        <AspectRatio ratio={21 / 9} placeholder="21 / 9" />
      </Card>
      <Card className="tray-span-5" title="Jar of 50 g" description="Product shots are 4 to 3.">
        <AspectRatio ratio="photo" placeholder="No photo yet" />
      </Card>
    </div>
  );
}
