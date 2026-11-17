import { Testimonial } from 'trayui-react';

export function Pair() {
  return (
    <div className="tray-stack">
      <div className="tray-bento">
        <Testimonial
          className="tray-span-7"
          tone="inverse"
          quote="We stopped losing orders the week we started. Friday is quiet now."
          name="Oksana Franko"
          detail="Perly Farm, Kyiv region"
        />
        <Testimonial
          className="tray-span-5"
          size="sm"
          quote="The packers learned it in a morning. Nobody asks me which box goes where any more."
          name="Marko Bilyk"
          detail="Meadow Bakery"
        />
      </div>
      <p className="tray-demo-note">These people, businesses and quotes are invented to show the layout. Use only real ones.</p>
    </div>
  );
}

export function RowOfThree() {
  return (
    <div className="tray-stack">
      <div className="tray-bento">
        <Testimonial
          className="tray-span-4"
          size="sm"
          quote="Labels come out with the courier's code on them. I stopped writing addresses by hand."
          name="Iryna Bondar"
          detail="Bondar Honey"
        />
        <Testimonial className="tray-span-4" size="sm" quote="Phone orders and shop orders finally sit in one list." name="Petro Moroz" detail="Hill Dairy" />
        <Testimonial
          className="tray-span-4"
          size="sm"
          quote="My mother packs on her phone now. She calls it the to-do list."
          name="Halyna Tkach"
          detail="Orchard Jams"
        />
      </div>
      <p className="tray-demo-note">These people, businesses and quotes are invented to show the layout. Use only real ones.</p>
    </div>
  );
}
