/* ── Admin: Listings Tab ─────────────────────────────────── */
import { CheckCircle2, X } from 'lucide-react';

const ListingsTab = ({ listings, onApprove, onReject }) => {
  if (listings.length === 0) {
    return (
      <div className="py-16 text-center">
        <CheckCircle2 className="w-12 h-12 text-ag-pay mx-auto mb-3" />
        <p className="font-bold text-ag-muted">All listings reviewed — inbox clear!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-ag-border">
      {listings.map(item => (
        <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-ag-primary rounded-btn flex items-center justify-center
              text-white font-bold text-xs shrink-0 shadow-sm">
              {item.crop.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-ag-body text-sm">{item.crop}</p>
              <p className="text-xs text-ag-muted">Farmer: {item.farmer} · {item.county}</p>
              <p className="text-xs text-ag-amber font-extrabold mt-0.5">{item.price}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onReject(item.id)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 border-2 border-red-200
                text-red-600 rounded-btn font-bold hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
            <button
              onClick={() => onApprove(item.id)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-ag-primary text-white
                rounded-btn font-bold hover:opacity-90 transition-opacity"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListingsTab;
