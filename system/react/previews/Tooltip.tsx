import { Button, Icon, Tooltip } from 'trayui-react';

export function Default() {
  return (
    <div className="tray-row" style={{ paddingBlockEnd: 'var(--space-16)' }}>
      <span className="tray-demo-note" style={{ marginBlockEnd: 'var(--space-10)' }}>Point at a button, or move to it with Tab. Two are held open here.</span>
      <Tooltip tip="Copy the link" open style={{ marginInlineStart: 'var(--space-10)' }}>
        <Button variant="quiet" size="sm" icon="copy" aria-label="Copy the link" />
      </Tooltip>
      <Tooltip tip="Download the receipt">
        <Button variant="quiet" size="sm" icon="download" aria-label="Download the receipt" />
      </Tooltip>
      <Tooltip tip="Search" keys={['Ctrl', 'K']} side="bottom" open style={{ marginInline: 'var(--space-12)' }}>
        <Button variant="quiet" size="sm" icon="search" aria-label="Search" />
      </Tooltip>
      <Tooltip tip="Dark theme">
        <button className="tray-toggle tray-toggle--icon" type="button" data-tray="toggle" aria-pressed="false" aria-label="Dark theme">
          <span data-when="off"><Icon name="moon" /></span>
          <span data-when="on"><Icon name="sun" /></span>
        </button>
      </Tooltip>
    </div>
  );
}

export function Toolbar() {
  const tools = [
    { tip: 'Bold', keys: ['Ctrl', 'B'], icon: 'bold' as const },
    { tip: 'Italic', keys: ['Ctrl', 'I'], icon: 'italic' as const },
    { tip: 'Underline', keys: ['Ctrl', 'U'], icon: 'underline' as const },
    { tip: 'Add a link', keys: ['Ctrl', 'L'], icon: 'link' as const },
  ];
  return (
    <div className="tray-row tray-row--sm" style={{ paddingBlockStart: 'var(--space-12)' }}>
      {tools.map((t, i) => (
        <Tooltip key={t.tip} tip={t.tip} keys={t.keys} open={i === tools.length - 1}>
          <button className="tray-toggle tray-toggle--icon" type="button" data-tray="toggle" aria-pressed={i === 0 ? 'true' : 'false'} aria-label={t.tip}>
            <Icon name={t.icon} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
