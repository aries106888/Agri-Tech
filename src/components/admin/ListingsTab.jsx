import { CheckCircle2, X } from 'lucide-react';

const ListingsTab = ({ listings, onApprove, onReject }) => (
  <div>
    {listings.length === 0 ? (
      <div className="py-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-ag-pay mx-auto mb-2" />
        <p className="font-bold text-ag-muted">All listings reviewed — inbox clear!</p>
      </div>
    ) : (
      <div className="divide-y divide-ag-border">
        {listings.map(item => (
          <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-ag-canvas">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-ag-primary rounded-btn flex items-center justify-center text-ag-primary-fixed font-bold text-xs shrink-0">
                {item.crop.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-ag-body text-sm">{item.crop}</p>
                <p className="text-xs text-ag-muted">Farmer: {item.farmer} · {item.county}</p>
                <p className="text-xs text-ag-amber font-bold">{item.price}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onReject(item.id)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 border-2 border-red-200 text-red-600 rounded-btn font-bold hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
              <button
                onClick={() => onApprove(item.id)}
                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-ag-primary text-white rounded-btn font-bold hover:opacity-90 transition-opacity"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default ListingsTab;
