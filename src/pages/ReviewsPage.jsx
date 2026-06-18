import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Search, CheckCircle, X } from 'lucide-react';

const REVIEWS = [
  { id: 1, reviewer: 'Naivas Supermarket', role: 'Buyer',  avatar: 'NS', target: 'James Mwangi',   targetRole: 'Farmer', crop: 'Maize 100 bags',   rating: 5, comment: 'Excellent quality Grade A maize. Timely delivery and very professional. Will order again!',              date: '2026-06-15', helpful: 12, verified: true  },
  { id: 2, reviewer: 'Janet Wanjiku',       role: 'Buyer',  avatar: 'JW', target: 'Mary Akinyi',    targetRole: 'Farmer', crop: 'Tomatoes 300kg',   rating: 4, comment: 'Good produce but 1 day delay on delivery. Overall satisfied with quality.',                             date: '2026-06-14', helpful: 5,  verified: true  },
  { id: 3, reviewer: 'David Ochieng',       role: 'Buyer',  avatar: 'DO', target: 'Peter Kibet',    targetRole: 'Farmer', crop: 'Beans 50 bags',    rating: 5, comment: 'Peter is one of the best bean farmers on this platform. Clean, dry, well-bagged.',                    date: '2026-06-13', helpful: 18, verified: true  },
  { id: 4, reviewer: 'James Mwangi',        role: 'Farmer', avatar: 'JM', target: 'Quickmart Nairobi', targetRole: 'Buyer', crop: 'Sweet Corn',    rating: 4, comment: 'Good buyer, payment through SecurePay was smooth. Would sell to them again.',                          date: '2026-06-10', helpful: 7,  verified: true  },
  { id: 5, reviewer: 'Grace Njoroge',       role: 'Farmer', avatar: 'GN', target: 'LocalMart Ltd',  targetRole: 'Buyer', crop: 'Spinach',          rating: 3, comment: 'Buyer negotiated well below asking price at last minute. Not ideal.',                                  date: '2026-06-08', helpful: 3,  verified: false },
];

const StarRow = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} className={`${size} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-ag-border'}`} />
    ))}
  </div>
);

const ReviewForm = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ target: '', crop: '', rating: 5, comment: '' });
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ag-border">
          <h3 className="font-extrabold text-ag-body flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Leave a Review
          </h3>
          <button onClick={onClose}><X className="w-5 h-5 text-ag-muted" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="form-label">Who are you reviewing?</label>
            <input value={form.target} onChange={e => up('target', e.target.value)}
              className="form-input" placeholder="Farmer or Buyer name" />
          </div>
          <div>
            <label className="form-label">Produce / Order</label>
            <input value={form.crop} onChange={e => up('crop', e.target.value)}
              className="form-input" placeholder="e.g. Maize 50 bags" />
          </div>
          <div>
            <label className="form-label">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1,2,3,4,5].map(i => (
                <button key={i} type="button" onClick={() => up('rating', i)}
                  className="transition-transform hover:scale-110">
                  <Star className={`w-8 h-8 ${i <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-ag-border'}`} />
                </button>
              ))}
              <span className="text-sm font-bold text-ag-body ml-2">{form.rating}/5</span>
            </div>
          </div>
          <div>
            <label className="form-label">Your Review</label>
            <textarea value={form.comment} onChange={e => up('comment', e.target.value)}
              className="form-input !h-28 resize-none" placeholder="Share your experience..." />
          </div>
          <button type="button"
            onClick={() => { onSubmit(form); onClose(); }}
            disabled={!form.target || !form.comment}
            className="btn-primary w-full">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [toast, setToast] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      r.reviewer.toLowerCase().includes(q) ||
      r.target.toLowerCase().includes(q) ||
      r.crop.toLowerCase().includes(q);
    const matchRating = !filterRating || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  const ratingDist = [5,4,3,2,1].map(r => ({
    stars: r,
    count: reviews.filter(rv => rv.rating === r).length,
    pct: Math.round(reviews.filter(rv => rv.rating === r).length / reviews.length * 100),
  }));

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-ag-pay text-white px-5 py-3 rounded-card
          shadow-lg font-bold text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold text-xl text-ag-body flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> Ratings and Reviews
        </h2>
        <button onClick={() => setShowForm(true)} className="btn-primary !min-h-0 !py-2.5 !px-4 !text-sm">
          + Write Review
        </button>
      </div>

      {/* Rating summary */}
      <div className="ag-card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-6xl font-extrabold text-ag-body">{avgRating}</p>
            <StarRow rating={Math.round(Number(avgRating))} size="w-5 h-5" />
            <p className="text-xs text-ag-muted mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            {ratingDist.map(r => (
              <button key={r.stars} type="button"
                onClick={() => setFilterRating(filterRating === r.stars ? 0 : r.stars)}
                className={`flex items-center gap-3 rounded-btn px-2 py-1 transition-colors
                  ${filterRating === r.stars ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-ag-canvas'}`}>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-bold text-ag-body w-3">{r.stars}</span>
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-ag-surface rounded-full h-2">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-xs text-ag-muted w-8 text-right">{r.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="form-input !pl-9 !py-2.5" placeholder="Search reviews..." />
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-4">
        {filtered.map(r => (
          <div key={r.id} className="ag-card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ag-primary flex items-center justify-center
                  text-white font-extrabold text-sm shrink-0">
                  {r.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-ag-body text-sm">{r.reviewer}</p>
                    <span className={r.role === 'Buyer' ? 'chip-transit' : 'chip-verified'}>{r.role}</span>
                    {r.verified && <CheckCircle className="w-3.5 h-3.5 text-ag-pay" />}
                  </div>
                  <p className="text-xs text-ag-muted">
                    reviewing <span className="font-semibold">{r.target}</span> ({r.targetRole}) &middot; {r.date}
                  </p>
                </div>
              </div>
              <StarRow rating={r.rating} />
            </div>

            <span className="chip-organic !text-[10px] self-start">{r.crop}</span>

            <p className="text-sm text-ag-body leading-relaxed italic">"{r.comment}"</p>

            <div className="flex items-center gap-4 pt-1 border-t border-ag-border">
              <button className="flex items-center gap-1.5 text-xs text-ag-muted hover:text-ag-primary transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({r.helpful})
              </button>
              <button className="flex items-center gap-1.5 text-xs text-ag-muted hover:text-ag-primary transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ReviewForm
          onClose={() => setShowForm(false)}
          onSubmit={form => {
            setReviews(r => [{
              id: Date.now(), reviewer: 'You', role: 'Farmer', avatar: 'ME',
              target: form.target, targetRole: 'Buyer', crop: form.crop,
              rating: form.rating, comment: form.comment,
              date: new Date().toISOString().slice(0,10), helpful: 0, verified: true,
            }, ...r]);
            showToast('Review submitted successfully!');
          }}
        />
      )}
    </div>
  );
}
