/* ── Admin Shared Micro-Components ───────────────────────── */
import { Star, Smile, Frown, Meh } from 'lucide-react';

/** Map status strings → CSS chip class */
export const chipByStatus = (s) => ({
  active:      'chip-verified',
  pending_kyc: 'chip-pending',
  completed:   'chip-completed',
  in_transit:  'chip-transit',
  pending:     'chip-pending',
  suspended:   'chip-sold-out',
  available:   'chip-verified',
  on_trip:     'chip-transit',
})[s] || 'chip-pending';

/** 5-star row */
export const StarRow = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`${size} ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-ag-border'}`}
      />
    ))}
  </div>
);

/** Sentiment emoji icon */
export const SentimentIcon = ({ s }) => {
  if (s === 'positive') return <Smile className="w-4 h-4 text-ag-pay" />;
  if (s === 'negative') return <Frown className="w-4 h-4 text-red-500" />;
  return <Meh className="w-4 h-4 text-ag-amber" />;
};

/** Role → badge colour */
export const roleColor = (role) => ({
  Buyer:     'bg-blue-100 text-blue-700',
  Farmer:    'bg-green-100 text-green-700',
  Logistics: 'bg-amber-100 text-amber-700',
  Platform:  'bg-purple-100 text-purple-700',
})[role] || 'bg-gray-100 text-gray-700';
