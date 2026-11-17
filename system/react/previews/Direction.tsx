import { Button, Direction, Field, Icon, Input, Message } from 'trayui-react';

function Panel({ caption, city, cityValue, gift, back, next }: { caption: string; city: string; cityValue: string; gift: string; back: string; next: string }) {
  return (
    <div className="tray-card tray-stack" style={{ padding: 'var(--space-6)' }}>
      <p className="label tray-soft">{caption}</p>
      <Field label={city}>
        <div className="tray-input-group">
          <span className="tray-input-group__addon">
            <Icon name="search" />
          </span>
          <Input defaultValue={cityValue} />
        </div>
      </Field>
      <label className="tray-switch tray-switch--row">
        <span className="tray-switch__text">
          <b>{gift}</b>
        </span>
        <input type="checkbox" role="switch" defaultChecked />
        <span className="tray-switch__track" />
      </label>
      <div className="tray-row tray-row--between">
        <Button variant="ghost" size="sm">
          <Icon name="arrow-left" flip />
          {back}
        </Button>
        <Button size="sm" iconEnd="arrow-right">
          {next}
        </Button>
      </div>
    </div>
  );
}

export function BothDirections() {
  return (
    <div className="tray-bento">
      <Direction dir="ltr" lang="en" className="tray-span-6">
        <Panel caption="Left to right" city="City" cityValue="Lviv" gift="Gift box" back="Back" next="Next" />
      </Direction>
      <Direction dir="rtl" lang="ar" className="tray-span-6">
        <Panel caption="من اليمين إلى اليسار" city="المدينة" cityValue="لفيف" gift="علبة هدية" back="رجوع" next="التالي" />
      </Direction>
    </div>
  );
}

export function RightToLeftThread() {
  return (
    <Direction lang="ar" style={{ maxWidth: 640 }}>
      <div className="tray-thread">
        <Message author="أوكسانا" time="14:02" avatar="أ">
          الساعي استلم الصندوق. سيتصل بك من البوابة.
        </Message>
        <Message variant="own" footer={<><Icon name="check" size="sm" />تم التسليم</>}>
          شكرا. هل يمكنه تركه عند الجار؟
        </Message>
      </div>
    </Direction>
  );
}
