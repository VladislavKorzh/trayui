import * as React from 'react';
import { Avatar, Badge, Button, Icon, Item } from 'trayui-react';

export function Filled() {
  return (
    <ul className="tray-items" role="list" style={{ maxWidth: 440 }}>
      <Item href="#" icon="truck" title="Order PL-20418" text="Two jars of 50 g, out for delivery" end={<Icon name="chevron-right" flip />} />
      <Item media={<Avatar initials="OF" />} title="Oksana Franko" text="Farm manager" end={<Badge tone="accent">On shift</Badge>} />
      <Item
        icon="bell"
        title="Order updates"
        text="A text when the courier sets off"
        end={
          <label className="tray-switch">
            <input type="checkbox" role="switch" defaultChecked aria-label="Order updates" />
            <span className="tray-switch__track" />
          </label>
        }
      />
    </ul>
  );
}

export function Ruled() {
  return (
    <ul className="tray-items tray-items--ruled" role="list" style={{ maxWidth: 440 }}>
      <Item icon="file" title="Receipt, 14 November" text="PDF, 84 KB" end={<Button variant="ghost" size="xs" icon="download" aria-label="Download the receipt of 14 November" />} />
      <Item icon="file" title="Receipt, 3 October" text="PDF, 81 KB" end={<Button variant="ghost" size="xs" icon="download" aria-label="Download the receipt of 3 October" />} />
      <Item size="sm" icon="map-pin" title="Farm shop" end="2.4 km" />
    </ul>
  );
}

export function AsButtons() {
  const [basket, setBasket] = React.useState(0);
  const jars = [
    { size: '30 g', text: 'For two, as a starter', price: '$39' },
    { size: '50 g', text: 'The one most people order', price: '$59' },
    { size: '100 g', text: 'For a table of six', price: '$109' },
  ];
  return (
    <div className="tray-stack tray-stack--sm" style={{ maxWidth: 440 }}>
      <ul className="tray-items" role="list">
        {jars.map((j) => (
          <Item key={j.size} size="sm" icon="plus" title={`Jar of ${j.size}`} text={j.text} end={j.price} onClick={() => setBasket(basket + 1)} />
        ))}
      </ul>
      <p className="tray-soft" role="status">{basket ? `${basket} ${basket === 1 ? 'jar' : 'jars'} in the basket` : 'Tap a jar to add it to the basket.'}</p>
    </div>
  );
}
