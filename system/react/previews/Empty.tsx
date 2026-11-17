import { Button, Card, Empty, Table } from 'trayui-react';

export function FirstUseAndNoResults() {
  return (
    <div className="tray-bento" style={{ alignItems: 'start' }}>
      <Card className="tray-span-6">
        <Empty icon="inbox" title="No orders yet" description="When someone orders a jar it shows up here." actions={<Button size="sm">Create an order</Button>} />
      </Card>
      <Empty
        className="tray-span-6"
        icon="search"
        title={'Nothing matches "truffle"'}
        description="Check the spelling, or look through all the notes."
        actions={<Button variant="quiet" size="sm">Clear the search</Button>}
      />
    </div>
  );
}

export function AllDone() {
  return (
    <Card style={{ maxWidth: 440 }}>
      <Empty icon="circle-check" title="Every order is packed" description="The courier collects at 14:00. New orders show up here." />
    </Card>
  );
}

export function SmallInATable() {
  return (
    <Table aria-label="Orders" style={{ maxWidth: 640 }}>
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Customer</th>
          <th scope="col" data-num>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={3}>
            <Empty size="sm" title="No order matches that filter" description="Check the spelling, or clear the filter." />
          </td>
        </tr>
      </tbody>
    </Table>
  );
}
