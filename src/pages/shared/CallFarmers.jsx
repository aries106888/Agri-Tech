import { useState } from 'react';
import { Phone, MessageSquare, Search, MapPin, Star, CheckCircle, Lock, Unlock } from 'lucide-react';

const COUNTIES = ['All Counties','Nakuru','Nairobi','Kisumu','Eldoret','Meru','Kisii','Machakos','Kiambu','Nyeri','Mombasa'];

const FARMERS = [
  { id: 1, name: 'James Mwangi', farm: 'Mwangi Organic Farms', county: 'Nakuru', subCounty: 'Rongai', village: 'Menengai', phone: '+254712345678', whatsapp: '+254712345678', crops: ['Maize','Beans','Wheat'], rating: 4.8, reviews: 42, verified: true, organic: true, avatar: 'JM', languages: ['English','Swahili','Kikuyu'], responseRate: 98, responseTime: '< 1hr' },
  { id: 2, name: 'Mary Akinyi', farm: 'Akinyi Fresh Produce', county: 'Kisumu', subCounty: 'Kisumu East', village: 'Kolwa', phone: '+254723456789', whatsapp: '+254723456789', crops: ['Tomatoes','Onions','Spinach'], rating: 4.6, reviews: 28, verified: true, organic: false, avatar: 'MA', languages: ['English','Swahili','Luo'], responseRate: 94, responseTime: '< 2hrs' },
  { id: 3, name: 'Peter Kibet', farm: 'Kibet Highland Farms', county: 'Eldoret', subCounty: 'Turbo', village: 'Moi\'s Bridge', phone: '+254734567890', whatsapp: '+254734567890', crops: ['Beans','Maize','Sorghum'], rating: 4.9, reviews: 67, verified: true, organic: true, avatar: 'PK', languages: ['English','Swahili','Kalenjin'], responseRate: 99, responseTime: '< 30min' },
  { id: 4, name: 'Grace Njoroge', farm: 'Njoroge Vegetable Garden', county: 'Limuru', subCounty: 'Limuru East', village: 'Tigoni', phone: '+254745678901', whatsapp: '+254745678901', crops: ['Spinach','Kale','Carrots','Potatoes'], rating: 4.7, reviews: 19, verified: true, organic: true, avatar: 'GN', languages: ['English','Swahili','Kikuyu'], responseRate: 91, responseTime: '< 3hrs' },
  { id: 5, name: 'David Mutua', farm: 'Mutua Orchards', county: 'Machakos', subCounty: 'Kangundo', village: 'Tala', phone: '+254756789012', whatsapp: '+254756789012', crops: ['Mangoes','Avocados','Oranges'], rating: 4.5, reviews: 34, verified: false, organic: false, avatar: 'DM', languages: ['English','Swahili','Kamba'], responseRate: 86, responseTime: '< 5hrs' },
  { id: 6, name: 'Fatuma Hassan', farm: 'Hassan Grain Store', county: 'Mombasa', subCounty: 'Likoni', village: 'Shelly Beach', phone: '+254767890123', whatsapp: '+254767890123', crops: ['Rice','Maize','Cassava'], rating: 4.4, reviews: 11, verified: true, organic: false, avatar: 'FH', languages: ['English','Swahili','Arabic'], responseRate: 88, responseTime: '< 4hrs' },
];

export default function CallFarmers() {
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('All Counties');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const filtered = FARMERS.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.farm.toLowerCase().includes(q) ||
      f.crops.some(c => c.toLowerCase().includes(q)) || f.county.toLowerCase().includes(q);
    const matchCounty   = county === 'All Counties' || f.county === county;
    const matchVerified = !onlyVerified || f.verified;
    const matchOrganic  = !onlyOrganic  || f.organic;
    return matchSearch && matchCounty && matchVerified && matchOrganic;
  });

  const maskPhone = phone => privacyMode ? phone.slice(0, 4) + '****' + phone.slice(-4) : phone;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Header */}
      <div className="green-gradient rounded-xl2 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Phone className="w-6 h-6" />
          <h2 className="font-extrabold text-xl">Call Farmers Directory</h2>
        </div>
        <p className="text-white/70 text-sm">Contact verified farmers directly — call, WhatsApp, or SMS.</p>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => setPrivacyMode(v => !v)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors
              ${privacyMode ? 'bg-ag-amber text-white' : 'bg-white/20 text-white'}`}>
            {privacyMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            Privacy Mode {privacyMode ? 'ON' : 'OFF'}
          </button>
          <span className="text-white/50 text-xs">
            {privacyMode ? 'Phone numbers hidden until order confirmed' : 'Phone numbers visible'}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="ag-card flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input !pl-9 !py-2.5" placeholder="Search by name, crop, or county…" />
        </div>
        <select value={county} onChange={e => setCounty(e.target.value)} className="form-input !w-auto !py-2.5">
          {COUNTIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => setOnlyVerified(v => !v)}
            className={`px-3 py-2 rounded-btn text-xs font-bold transition-colors flex items-center gap-1.5
              ${onlyVerified ? 'bg-ag-primary text-white' : 'bg-ag-surface text-ag-muted hover:bg-ag-border'}`}>
            <CheckCircle className="w-3.5 h-3.5" /> Verified
          </button>
          <button onClick={() => setOnlyOrganic(v => !v)}
            className={`px-3 py-2 rounded-btn text-xs font-bold transition-colors flex items-center gap-1.5
              ${onlyOrganic ? 'bg-green-600 text-white' : 'bg-ag-surface text-ag-muted hover:bg-ag-border'}`}>
             Organic
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-ag-muted font-bold -mt-2">
        {filtered.length} farmer{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="ag-card-hover flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-ag-primary flex items-center justify-center
                text-white font-extrabold text-lg shrink-0">{f.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-extrabold text-ag-body">{f.name}</p>
                  {f.verified && <span className="chip-verified text-[9px]"></span>}
                  {f.organic && <span className="chip-organic text-[9px]">Organic</span>}
                </div>
                <p className="text-xs text-ag-muted">{f.farm}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-ag-muted" />
                  <span className="text-xs text-ag-muted">{f.subCounty}, {f.county}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(f.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-ag-border'}`} />
                ))}
                <span className="text-xs font-bold text-ag-body ml-1">{f.rating}</span>
              </div>
              <span className="text-xs text-ag-muted">({f.reviews} reviews)</span>
            </div>

            {/* Crops */}
            <div className="flex flex-wrap gap-1.5">
              {f.crops.map(c => (
                <span key={c} className="bg-ag-primary-fixed text-ag-primary text-xs font-bold px-2.5 py-1 rounded-full">
                  {c}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-ag-surface rounded-btn p-2">
                <p className="text-ag-muted font-bold">Response Rate</p>
                <p className="font-extrabold text-ag-pay">{f.responseRate}%</p>
              </div>
              <div className="bg-ag-surface rounded-btn p-2">
                <p className="text-ag-muted font-bold">Response Time</p>
                <p className="font-extrabold text-ag-primary">{f.responseTime}</p>
              </div>
            </div>

            {/* Contact buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-ag-border" onClick={e => e.stopPropagation()}>
              <a href={`tel:${f.phone}`}
                className="flex flex-col items-center gap-1 py-2.5 rounded-btn bg-green-50 border border-green-200
                  text-green-700 hover:bg-green-100 transition-colors text-xs font-bold">
                <Phone className="w-4 h-4" />
                {maskPhone(f.phone)}
              </a>
              <a href={`https://wa.me/${f.whatsapp.replace('+', '')}`} target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-1 py-2.5 rounded-btn bg-emerald-50 border border-emerald-200
                  text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-bold">
                <span className="text-base leading-none"></span>
                WhatsApp
              </a>
              <a href={`sms:${f.phone}`}
                className="flex flex-col items-center gap-1 py-2.5 rounded-btn bg-blue-50 border border-blue-200
                  text-blue-700 hover:bg-blue-100 transition-colors text-xs font-bold">
                <MessageSquare className="w-4 h-4" />
                SMS
              </a>
            </div>

            <p className="text-[10px] text-ag-muted">
               Speaks: {f.languages.join(', ')}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-ag-muted">
          <Phone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold">No farmers match your search</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
