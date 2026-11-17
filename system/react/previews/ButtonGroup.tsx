import * as React from 'react';
import { ButtonGroup } from 'trayui-react';

export function Groups() {
  return (
    <div className="tray-row">
      <ButtonGroup
        label="Message actions"
        items={[{ label: 'Reply', icon: 'arrow-left' }, { label: 'Forward' }, { label: 'Archive' }]}
      />
      <ButtonGroup label="Quantity" stepper defaultValue={2} min={1} max={9} />
      <ButtonGroup
        label="File actions"
        size="sm"
        items={[
          { label: 'Copy', icon: 'copy', iconOnly: true },
          { label: 'Download', icon: 'download', iconOnly: true },
          { label: 'Share', icon: 'share', iconOnly: true },
          { label: 'Delete', icon: 'trash-2', iconOnly: true, separated: true },
        ]}
      />
      <ButtonGroup label="Save" size="sm" items={[{ label: 'Save draft' }, { label: 'More ways to save', icon: 'chevron-down', iconOnly: true }]} />
      <ButtonGroup
        label="Zoom"
        size="sm"
        orientation="vertical"
        items={[
          { label: 'Zoom in', icon: 'plus', iconOnly: true },
          { label: 'Zoom out', icon: 'minus', iconOnly: true },
        ]}
      />
    </div>
  );
}

export function QuantityStepper() {
  const [jars, setJars] = React.useState(2);
  return (
    <div className="tray-row">
      <ButtonGroup label="Jars of 50 g" stepper defaultValue={2} min={1} max={9} onChange={setJars} />
      <p className="tray-soft">
        {jars} {jars === 1 ? 'jar' : 'jars'} of 50 g, ${jars * 59}
      </p>
    </div>
  );
}
