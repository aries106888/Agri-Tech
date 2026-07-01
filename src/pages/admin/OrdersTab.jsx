/* ── Admin: Orders Tab ───────────────────────────────────── */
import { chipByStatus } from '../../components/admin/AdminHelpers';

const OrdersTab = ({ orders, onUpdateStatus }) => (
  <div className="divide-y divide-ag-border">
    {orders.map(order => (
      <div key={order.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas transition-colors">
        <div>
          <p className="font-bold text-ag-body text-sm">{order.crop}</p>
          <p className="text-xs text-ag-muted mt-0.5">
            Buyer: <span className="font-semibold">{order.buyer}</span>
            {' · '}
            Farmer: <span className="font-semibold">{order.farmer}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <span className="text-ag-amber font-extrabold text-sm">
            KSh {order.amount.toLocaleString()}
          </span>
          <span className={chipByStatus(order.status)}>
            {order.status.replace('_', ' ')}
          </span>
          <select
            value={order.status}
            onChange={e => onUpdateStatus(order.id, e.target.value)}
            className="text-xs border border-ag-border rounded-btn px-2 py-1.5 font-bold
              text-ag-muted bg-white focus:outline-none focus:border-ag-primary cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    ))}
  </div>
);

export default OrdersTab;
