import { useState } from 'react';
import { 
  HelpCircle, Phone, Search, ChevronDown, ChevronUp, BookOpen, 
  ShieldCheck, Truck, Archive, Wallet, HelpCircle as HelpIcon, ArrowRight
} from 'lucide-react';

const FAQS = [
  {
    q: 'How does ShambaPoint Agri-Tech work?',
    a: 'ShambaPoint is a farm-to-buyer marketplace. We cut out middle-men by providing farmers with direct access to corporate and retail buyers. The platform integrates real-time IoT weather tracking, smart cold-chain storage management, logistics scheduling, and secure escrow payments to make farming operations reliable and secure.',
    cat: 'general'
  },
  {
    q: 'What is Smart SecurePay and how does it safeguard funds?',
    a: 'Smart SecurePay is an escrow settlement system. When a buyer places an order, their payment is secured in a holding account. The funds are only released to the farmer after the buyer verifies delivery of the produce in the correct quantity and quality. This protects farmers from non-payment and buyers from bad produce.',
    cat: 'payment'
  },
  {
    q: 'How do you ensure fresh crop delivery in logistics?',
    a: 'We coordinate with vetted logistics partners equipped with cold-chain monitoring. Drivers get real-time safety advisories (Road Slickness, Wind Hazards, and Spoilage indices) based on live meteorological data from county stations, ensuring high-risk transport corridors are navigated safely.',
    cat: 'logistics'
  },
  {
    q: 'How does smart produce cold storage operate?',
    a: 'Our smart cold storage facilities monitor temperature, relative humidity, and moisture levels through IoT observatories. If humidity rises above mold thresholds or temperature rises, automatic alerts are dispatched to operators, safeguarding stored potatoes, maize, and horticultural crops.',
    cat: 'storage'
  },
  {
    q: 'How can buyers clarify orders or verify grade quality?',
    a: 'Buyers can reach out to our dedicated support hotlines or use direct in-app messaging with farmers. ShambaPoint officers perform random physical inspections at major transshipment centers to guarantee grade quality (A, B, or C) matches the digital listing.',
    cat: 'general'
  }
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeCat, setActiveCat] = useState('all');

  const filteredFaqs = FAQS.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || 
                          faq.a.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCat === 'all' || faq.cat === activeCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-900 to-green-950 rounded-xl2 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-8 translate-x-8">
          <HelpIcon className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-white/20 p-2 rounded-lg">
              <HelpCircle className="w-6 h-6 text-amber-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">ShambaPoint AgriTech Support</span>
          </div>
          <h2 className="font-extrabold text-2xl mb-2">Support & Knowledge Center</h2>
          <p className="text-emerald-100 text-sm leading-relaxed">
            Get instant clarification on crop logistics, cold chain monitoring, secure escrow, and buyer-farmer relationships.
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: FAQs & Search */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="ag-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-ag-body dark:text-white">Frequently Asked Questions</h3>
                <p className="text-xs text-ag-muted mt-0.5">Quick self-service answers about platform operations</p>
              </div>
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input 
                  type="text" 
                  placeholder="Search help articles..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input !py-2 !pl-9"
                />
                <Search className="w-4 h-4 text-ag-outline absolute left-3 top-3" />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-ag-border dark:border-dark-border">
              {[
                { id: 'all', label: 'All FAQs' },
                { id: 'general', label: 'Platform Basics' },
                { id: 'payment', label: 'Escrow & SecurePay' },
                { id: 'logistics', label: 'Logistics Safety' },
                { id: 'storage', label: 'IoT Cold Storage' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveCat(t.id)}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    activeCat === t.id 
                      ? 'bg-ag-primary text-white' 
                      : 'bg-ag-surface dark:bg-dark-surface text-ag-muted hover:bg-ag-border dark:hover:bg-dark-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="flex flex-col gap-3">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12 text-ag-muted font-bold text-xs">
                  No FAQs matching your query. Please search something else or contact buyer support.
                </div>
              ) : (
                filteredFaqs.map((faq, idx) => {
                  const isExp = expandedFaq === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-ag-border dark:border-dark-border rounded-card overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setExpandedFaq(isExp ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-extrabold text-sm text-ag-body dark:text-white bg-ag-surface/20 hover:bg-ag-surface/50 dark:bg-dark-surface/10 dark:hover:bg-dark-surface/30 transition-all"
                      >
                        <span>{faq.q}</span>
                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {isExp && (
                        <div className="p-4 border-t border-ag-border dark:border-dark-border bg-white dark:bg-dark-card text-xs text-ag-muted leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Operational Basis / Platform Blueprint */}
          <div className="ag-card">
            <h3 className="font-extrabold text-ag-body dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-ag-primary" /> The ShambaPoint Agri-Tech System
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-ag-surface/30 dark:bg-dark-surface/20 rounded-card flex gap-3">
                <ShieldCheck className="w-6 h-6 text-ag-primary shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-ag-body dark:text-white">Smart Escrow (SecurePay)</h4>
                  <p className="text-[11px] text-ag-muted mt-1 leading-relaxed">
                    Protects payments using multi-sig secure contracts. Funds are locked at order creation and only released upon certified delivery confirmation.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-ag-surface/30 dark:bg-dark-surface/20 rounded-card flex gap-3">
                <Truck className="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-ag-body dark:text-white">Logistics & Radar Risk</h4>
                  <p className="text-[11px] text-ag-muted mt-1 leading-relaxed">
                    Uses live meteorological APIs to compute road slickness, wind gusts, and thermal spoilage indices, warning drivers of highland corridor risks.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-ag-surface/30 dark:bg-dark-surface/20 rounded-card flex gap-3">
                <Archive className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-ag-body dark:text-white">Cold-Chain IoT Observatories</h4>
                  <p className="text-[11px] text-ag-muted mt-1 leading-relaxed">
                    IoT sensors track real-time moisture, hum, and temp within silos and cold rooms. Elevating values trigger automatic notifications to operators.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-ag-surface/30 dark:bg-dark-surface/20 rounded-card flex gap-3">
                <Wallet className="w-6 h-6 text-purple-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs text-ag-body dark:text-white">Direct-to-Buyer Market</h4>
                  <p className="text-[11px] text-ag-muted mt-1 leading-relaxed">
                    Bypasses intermediaries by linking smallholder cooperatives directly with wholesale hotel/supermarket procurement chains, increasing earnings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact Hotlines & Direct Call Support */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Buyer Hotline Info */}
          <div className="bg-gradient-to-br from-ag-primary to-emerald-950 text-white rounded-xl2 p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
              <Phone className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <Phone className="w-5 h-5 text-amber-300 animate-pulse" />
              <h3 className="font-extrabold text-sm">Direct Support Hotlines</h3>
            </div>
            
            <p className="text-xs text-emerald-100 leading-relaxed relative z-10">
              Need immediate clarification on how ShambaPoint Agri-Tech coordinates orders, escrow releases, or quality grading? Call our hotlines directly:
            </p>

            <div className="flex flex-col gap-2.5 relative z-10">
              {/* Buyer Support */}
              <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Procurement & Buyer Hotlines</span>
                <p className="font-black text-sm text-white mt-1">+254 700 900 100</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Corporate sales, SecurePay escrow disputes, and delivery issues.</p>
              </div>

              {/* Farmer Support */}
              <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Farmer & Cooperative Helpdesk</span>
                <p className="font-black text-sm text-white mt-1">+254 700 800 200</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Listing activation, silo storage bookings, and payout status.</p>
              </div>

              {/* Logistics Support */}
              <div className="bg-white/10 p-3.5 rounded-lg border border-white/10 hover:bg-white/15 transition-all">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">Logistics & Transit Desk</span>
                <p className="font-black text-sm text-white mt-1">+254 700 700 300</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Escarpment advisories, cold-chain IoT tracking, and truck clearance.</p>
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-[10px] text-emerald-100/70 text-center relative z-10">
              Support operates Mon - Sat: 6:00 AM - 9:00 PM (EAT)
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="ag-card border border-ag-primary-cont/30 flex flex-col gap-3">
            <h4 className="font-extrabold text-xs text-ag-body dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ag-primary animate-ping" />
              Need Quick Help?
            </h4>
            <p className="text-[11px] text-ag-muted leading-relaxed">
              Our AI Assistant is available 24/7 to clarify details on the Smart Produce Storage systems, secure payment rules, or real-time county weather metrics.
            </p>
            <a 
              href="/farmer/messages"
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ag-primary-cont text-ag-primary text-xs font-black rounded-btn hover:bg-ag-primary hover:text-white transition-all text-center"
            >
              Ask AI Assistant <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
