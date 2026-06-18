import { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, X, Eye, Shield } from 'lucide-react';

const DISPUTES = [
  {
    id: 'DSP-001', orderId: 'ORD-2489', buyer: 'Janet Wanjiku', farmer: 'Mary Akinyi',
    crop: 'Red Onions 200kg', amount: 21000, reason: 'Produce received in poor condition — excessive rot',
    status: 'open', filed: '2026-06-16', escrow: 'locked',
    evidence: ['Photo of rotten onions uploaded', 'Delivery note attached'],
    timeline: [
      { date: '2026-06-16 10:20', event: 'Dispute filed by buyer' },
      { date: '2026-06-16 11:05', event: 'Funds locked in escrow' },
      { date: '2026-06-16 14:30', event: 'Farmer notified — awaiting response' },
    ],
  },
  {
    id: 'DSP-002', orderId: 'ORD-2471', buyer: 'David Ochieng', farmer: 'Peter Kibet',
    crop: 'Beans 50 bags', amount: 44500, reason: 'Delivery was 3 days late — lost buyers',
    status: 'under_review', filed: '2026-06-14', escrow: 'locked',
    evidence: ['Delivery receipt showing late date', 'Buyer loss statement'],
    timeline: [
      { date: '2026-06-14 09:00', event: 'Dispute filed by buyer' },
      { date: '2026-06-14 10:00', event: 'Funds locked in escrow' },
      { date: '2026-06-15 08:00', event: 'Admin review started' },
      { date: '2026-06-15 16:00', event: 'Both parties interviewed via call' },
    ],
  },
  {
    id: 'DSP-003', orderId: 'ORD-2450', buyer: 'Naivas Ltd', farmer: 'James Mwangi',
    crop: 'Maize 100 bags', amount: 82000, reason: 'Quantity short — received 87 bags, paid for 100',
    status: 'resolved', filed: '2026-06-10', escrow: 'partial_release',
    resolution: 'KSh 10,660 refunded to buyer. KSh 71,340 released to farmer.',
    evidence: ['Weighbridge slip', 'Delivery note discrepancy report'],
    timeline: [
      { date: '2026-06-10 13:00', event: 'Dispute filed' },
      { date: '2026-06-11 09:00', event: 'Admin review started' },
      { date: '2026-06-12 11:00', event: 'Resolution decided — partial release' },
      { date: '2026-06-12 14:00', event: 'KSh 10,660 refunded to buyer' },
      { date: '2026-06-12 14:05', event: 'KSh 71,340 released to farmer' },
    ],
  },
];

const statusConfig = {
  open:          { label: 'Open',          chip: 'chip-dispute', icon: AlertTriangle },
  under_review:  { label: 'Under Review',  chip: 'chip-escrow',  icon: Clock },
  resolved:      { label: 'Resolved',      chip: 'chip-completed', icon: CheckCircle },
};

export default function DisputesPage() {
  const [disputes] = useState(DISPUTES);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [resolution, setResolution] = useState('');
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const filtered = disputes.filter(d => filter === 'all' || d.status === filter);

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-pay text-white px-5 py-3 rounded-card
          shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-ag-dispute to-purple-700 rounded-xl2 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6" />
          <h2 className="font-extrabold text-xl">Dispute Resolution Centre</h2>
        </div>
        <p className="text-white/70 text-sm">
          All funds remain locked in SecurePay escrow until disputes are resolved.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open',         value: disputes.filter(d => d.status === 'open').length,         color: 'text-ag-dispute' },
          { label: 'Under Review', value: disputes.filter(d => d.status === 'under_review').length,  color: 'text-ag-escrow' },
          { label: 'Resolved',     value: disputes.filter(d => d.status === 'resolved').length,      color: 'text-ag-pay' },
        ].map(s => (
          <div key={s.label} className="ag-card text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ag-muted font-bold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'open', 'under_review', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-btn text-xs font-bold capitalize transition-colors
              ${filter === f ? 'bg-ag-primary text-white' : 'bg-ag-surface text-ag-muted hover:bg-ag-border'}`}>
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="ag-card !p-0">
        <div className="divide-y divide-ag-border">
          {filtered.map(d => {
            const cfg = statusConfig[d.status];
            return (
              <div key={d.id} className="p-5 hover:bg-ag-canvas transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-btn flex items-center justify-center shrink-0
                      ${d.status === 'open' ? 'bg-ag-dispute-cont' : d.status === 'resolved' ? 'bg-green-100' : 'bg-ag-escrow-cont'}`}>
                      <cfg.icon className={`w-5 h-5 ${d.status === 'open' ? 'text-ag-dispute' : d.status === 'resolved' ? 'text-ag-pay' : 'text-ag-escrow'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-ag-body">{d.crop}</p>
                        <span className={cfg.chip}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-ag-muted mt-0.5">{d.id} · Filed {d.filed}</p>
                      <p className="text-xs text-ag-muted">
                        Buyer: <span className="font-semibold">{d.buyer}</span> ·
                        Farmer: <span className="font-semibold">{d.farmer}</span>
                      </p>
                      <p className="text-xs text-red-600 mt-1 font-semibold italic">"{d.reason}"</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-extrabold text-ag-amber">KSh {d.amount.toLocaleString()}</p>
                    <button onClick={() => setSelected(d)}
                      className="btn-ghost !py-1.5 !px-3 !text-xs">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                </div>
                {d.status === 'resolved' && d.resolution && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-btn p-2.5 text-xs text-green-800">
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />
                    <strong>Resolution:</strong> {d.resolution}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box max-w-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
              <h3 className="font-extrabold text-ag-body flex items-center gap-2">
                <Shield className="w-5 h-5 text-ag-dispute" /> {selected.id}
              </h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-ag-muted" /></button>
            </div>
            <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Order ID', selected.orderId],
                  ['Amount', `KSh ${selected.amount.toLocaleString()}`],
                  ['Buyer', selected.buyer],
                  ['Farmer', selected.farmer],
                  ['Filed', selected.filed],
                  ['Escrow', selected.escrow.replace('_', ' ')],
                ].map(([k, v]) => (
                  <div key={k} className="bg-ag-surface rounded-btn p-3">
                    <p className="text-xs text-ag-muted font-bold uppercase tracking-wide mb-0.5">{k}</p>
                    <p className="font-bold text-ag-body">{v}</p>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div className="alert-danger text-sm">{selected.reason}</div>

              {/* Evidence */}
              <div>
                <p className="font-bold text-ag-body mb-2 text-sm">Evidence Submitted</p>
                <ul className="space-y-1">
                  {selected.evidence.map((e, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ag-muted">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {e}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div>
                <p className="font-bold text-ag-body mb-3 text-sm">Dispute Timeline</p>
                <div className="relative pl-4 border-l-2 border-ag-border space-y-4">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 top-0.5 w-3 h-3 rounded-full bg-ag-primary border-2 border-white" />
                      <p className="text-xs text-ag-muted">{t.date}</p>
                      <p className="text-sm font-semibold text-ag-body">{t.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Resolution (only if open/under review) */}
              {selected.status !== 'resolved' && (
                <div className="flex flex-col gap-3">
                  <label className="form-label">Admin Resolution Notes</label>
                  <textarea value={resolution} onChange={e => setResolution(e.target.value)}
                    className="form-input !h-24 resize-none"
                    placeholder="Describe your resolution decision…" />
                  <div className="flex gap-3">
                    <button
                      onClick={() => { showToast('Funds released to farmer!'); setSelected(null); }}
                      className="btn-pay flex-1">
                      Release to Farmer
                    </button>
                    <button
                      onClick={() => { showToast('Refund issued to buyer!'); setSelected(null); }}
                      className="btn-danger flex-1">
                      Refund to Buyer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
