---
category: Account
keywords: [integration card, integrations, apps, connect, connections, marketplace, plugins, services]
---
# Integration Card

An integration card stands for one outside service the product can work with: its mark, its name, what connecting it does, and the control that connects it.

## Use
```tsx
<div className="tray-integrations">                       {/* the grid: cards at least 17rem wide that fill the row */}
  <IntegrationCard icon="truck" title="Courier tracking" description="Shows where each box is and tells the customer."
    defaultChecked onCheckedChange={save} status="On since 2 November" link={{ label: 'Settings', href: '/integrations/courier' }} />
  <IntegrationCard icon="message-square" title="Chat alerts" description="Posts new orders to a channel your team already reads."
    action="Connect" onAction={connect} status="Not connected" />
  <IntegrationCard icon="mail" title="Email receipts" description="Sends the customer a receipt from your own address."
    action="Fix" onAction={fix} error="The address needs to be confirmed again" />
</div>
```

## Parts
- The mark: the service's own `logo` in the 48px tile when you may use it, otherwise an `icon` for what the service does.
- The control at the end of the head: a Switch, named with the title, for a connection that turns on and off in place (`checked` or `defaultChecked`, `onCheckedChange`). Or a small quiet button (`action`: "Connect", "Fix", "Upgrade") for one that opens the other service to sign in.
- The foot: the state in words (`status`) and a `link` to the integration's own settings, or to the plans that have it. A failed connection goes in `error`, in danger with an icon, with the fix on the button.

## Do and don't
- Do say what the person gets, not what the service is: "Sends each paid order to your books".
- Do show a failed connection in the foot in danger with a way to fix it.
- Don't draw another company's logo from memory.
- Don't connect on a switch when the service needs a sign-in: use the button.
