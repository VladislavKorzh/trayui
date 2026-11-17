---
category: Billing
keywords: [payment method, credit card, card on file, saved cards, card form, card number, checkout, billing card]
---
# Payment Method

Payment method lists the cards on file as choices, marks the one that is charged, and takes a new card in three fields.

## Use
```tsx
<PaymentMethod                                                   // mode 'saved': the cards on file
  cards={[
    { id: 'card_4242', last4: '4242', expires: '08/27', isDefault: true },   // a "Default" badge
    { id: 'card_0005', brand: 'Visa', last4: '0005', expires: '01/28' },     // "Visa ending 0005"
    { id: 'card_1881', last4: '1881', expires: '03/26', expired: true },     // "Expired in 03/26", cannot be chosen
  ]}
  onChange={(id) => setCard(id)}
  actions={<Button variant="quiet" size="sm" icon="plus">Add a card</Button>}
/>

<PaymentMethod mode="new" onSave={(card) => saveCard(card)} onCancel={close} />   {/* the form */}
```

## Parts
- Mode 'saved': a Radio Group of choice cards under "Pay with". Each card is named by its last four digits, with its expiry date or what is wrong with it on the second line, and a "Default" badge on the card that is charged. Buttons for the list go under it in `actions`.
- Mode 'new': a form on a grey card with the card number (an Input Group with a card icon), the expiry date and the security code, a line of help, and "Save the card". `onSave` receives the three fields as typed.

## Behaviour
The system's `mask` behaviour formats while the person types: the number in groups of four, the expiry date as MM/YY. It formats and nothing more: check the number on the server. Every field carries its `autocomplete` value, so the browser can fill them.

## Do and don't
- Do say what is wrong with a card in its second line: "Expired in 03/26", "Declined on 1 October".
- Do name the card network in words if you name it ("Visa ending 4242"); never draw a logo you do not hold.
- Don't ask for the name on the card or a billing address unless your payment provider needs them.
- Don't store or show a full card number or a security code anywhere.
