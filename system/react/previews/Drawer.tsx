import { Button, Drawer, Field, Icon } from 'trayui-react';

export function AddToOrder() {
  return (
    <div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '28rem' }}>
      <Drawer modal={false} defaultOpen title="Add to the order" footer={<Button block end="$118" data-close>Add to the order</Button>}>
        <div className="tray-stack" style={{ marginBlockStart: 'var(--space-5)' }}>
          <div className="tray-seg tray-seg--fill" role="radiogroup" aria-label="Jar size">
            <label className="tray-seg__item"><input type="radio" name="dr-jar" /><span>30 g</span></label>
            <label className="tray-seg__item"><input type="radio" name="dr-jar" defaultChecked /><span>50 g</span></label>
            <label className="tray-seg__item"><input type="radio" name="dr-jar" /><span>100 g</span></label>
          </div>
          <div className="tray-row tray-row--between">
            <span className="nav">Jars</span>
            <div className="tray-btn-group" role="group" aria-label="Quantity">
              <button className="tray-btn-group__item tray-btn-group__item--icon" type="button" aria-label="One fewer"><Icon name="minus" /></button>
              <output className="tray-btn-group__value">2</output>
              <button className="tray-btn-group__item tray-btn-group__item--icon" type="button" aria-label="One more"><Icon name="plus" /></button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export function CourierNote() {
  return (
    <div className="tray-stack">
      <div>
        <Drawer
          trigger={<Button variant="quiet" size="sm" icon="message-square">Note for the courier</Button>}
          title="Note for the courier"
          footer={<Button block data-close>Save the note</Button>}
        >
          <div className="tray-stack" style={{ marginBlockStart: 'var(--space-5)' }}>
            <Field label="What should the courier know?" controlId="dr-note"><textarea className="tray-textarea" id="dr-note" rows={3} /></Field>
          </div>
        </Drawer>
      </div>
      <div className="tray-stage tray-stage--scrim" style={{ minBlockSize: '30rem' }}>
        <Drawer modal={false} defaultOpen title="Note for the courier" footer={<Button block data-close>Save the note</Button>}>
          <div className="tray-stack" style={{ marginBlockStart: 'var(--space-5)' }}>
            <Field label="What should the courier know?" controlId="dr-note-open">
              <textarea className="tray-textarea" id="dr-note-open" rows={3} defaultValue="Leave it with the neighbour at number 12." />
            </Field>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
