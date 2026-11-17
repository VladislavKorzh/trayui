import * as React from 'react';
import { CheckoutSummary } from 'trayui-react';

export function YearlyPlan() {
  return (
    <CheckoutSummary
      style={{ maxWidth: '26rem', padding: 'var(--space-8)' }}
      title="Your plan"
      lines={[
        { label: 'Shop plan', detail: '12 months at $24, billed yearly', amount: '$288.00' },
        { label: 'Two extra seats', detail: '12 months at $4 each', amount: '$96.00' },
        { label: 'Promo code AUTUMN', detail: '10% off the first year', amount: '−$38.40' },
        { label: 'VAT 20%', amount: '$69.12' },
      ]}
      promo
      defaultPromoCode="AUTUMN"
      total="$414.72"
      payLabel="Pay $414.72"
      note="Renews on 15 November 2027. Cancel any time."
    />
  );
}

export function PromoApplied() {
  const [applied, setApplied] = React.useState('AUTUMN');
  const discount = applied === 'AUTUMN';
  return (
    <CheckoutSummary
      style={{ maxWidth: '26rem', padding: 'var(--space-8)' }}
      title="Your order"
      lines={[
        { label: 'Snail caviar, 50 g', detail: 'Two jars at $29.50', amount: '$59.00' },
        ...(discount ? [{ label: 'Promo code AUTUMN', detail: '10% off', amount: '−$5.90' }] : []),
        { label: 'Chilled courier', detail: 'Kyiv, the same day', amount: '$9.00' },
      ]}
      promo
      defaultPromoCode="AUTUMN"
      onApplyPromo={(code) => setApplied(code.toUpperCase())}
      total={discount ? '$62.10' : '$68.00'}
      payLabel={discount ? 'Pay $62.10' : 'Pay $68.00'}
      note="Payments are encrypted. Order PL-20431."
    />
  );
}

export function SingleItem() {
  return (
    <div className="tray-stack" style={{ maxWidth: 440 }}>
      <p className="tray-demo-note">A short one, for a single item</p>
      <CheckoutSummary variant="plain" lines={[{ label: 'Market plan', detail: 'Monthly', amount: '$79.00' }]} total="$79.00" />
    </div>
  );
}
