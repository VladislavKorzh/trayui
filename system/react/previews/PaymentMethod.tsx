import * as React from 'react';
import { Button, PaymentMethod, type SavedCard } from 'trayui-react';

const cards: SavedCard[] = [
  { id: 'card_4242', last4: '4242', expires: '08/27', isDefault: true },
  { id: 'card_0005', last4: '0005', expires: '01/28' },
  { id: 'card_1881', last4: '1881', expires: '03/26', expired: true },
];

export function SavedAndNew() {
  return (
    <div className="tray-row" style={{ alignItems: 'flex-start' }}>
      <PaymentMethod
        style={{ flex: '1 1 22rem' }}
        cards={cards}
        actions={
          <>
            <Button variant="quiet" size="sm" icon="plus">Add a card</Button>
            <Button variant="ghost" size="sm">Remove the expired card</Button>
          </>
        }
      />
      <PaymentMethod mode="new" style={{ flex: '1 1 22rem', padding: 'var(--space-8)' }} defaultValues={{ number: '4242 4242 4242' }} onCancel={() => {}} />
    </div>
  );
}

export function ChooseACard() {
  const [card, setCard] = React.useState('card_0005');
  const chosen = cards.find((c) => c.id === card);
  return (
    <div className="tray-stack" style={{ maxWidth: 440 }}>
      <PaymentMethod
        label="Charge order PL-20431 to"
        value={card}
        onChange={setCard}
        cards={[
          { id: 'card_4242', brand: 'Visa', last4: '4242', expires: '08/27', isDefault: true },
          { id: 'card_0005', brand: 'Mastercard', last4: '0005', expires: '01/28' },
          { id: 'card_7710', brand: 'Visa', last4: '7710', expires: '11/29', note: 'Declined on 1 October', disabled: true },
        ]}
      />
      <p className="tray-soft">$59.00 goes on the card ending {chosen?.last4}.</p>
    </div>
  );
}
