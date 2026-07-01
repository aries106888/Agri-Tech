/* ── ShambaPoint Help Center (Role-Specific) ─────────────── */
import { useState } from 'react';
import {
  HelpCircle, Phone, Search, ChevronDown, ChevronUp,
  MessageSquare, Mail, Clock, CheckCircle2,
  Leaf, ShoppingBag, Truck, Shield, BookOpen, ArrowRight
} from 'lucide-react';

/* ── Role-specific config ─────────────────────────────────── */
const ROLE_CONFIG = {
  farmer: {
    label: 'Farmer Support',
    icon: Leaf,
    color: 'from-ag-primary to-emerald-800',
    accent: 'text-ag-primary',
    badge: 'bg-emerald-100 text-ag-primary',
    contacts: [
      { label: 'Farmer Hotline (24/7)',    number: '+254 700 111 222', icon: Phone,   note: 'Crop listings, quality disputes, payments' },
      { label: 'Agronomy Advisory Line',   number: '+254 711 333 444', icon: Phone,   note: 'Planting advice, pest control, weather alerts' },
      { label: 'Farmer WhatsApp Group',    number: '+254 722 555 666', icon: MessageSquare, note: 'Peer support & market tips' },
      { label: 'Email Support',            number: 'farmers@shambapoint.co.ke', icon: Mail, note: 'Non-urgent queries, documents, KYC' },
    ],
    faqs: [
      { q: 'How do I list my produce on ShambaPoint?', a: 'Go to My Products in your dashboard, click "Add Listing", fill in crop details, price, quantity, and county. Your listing goes live after admin approval — usually within 2 hours.' },
      { q: 'When do I get paid after a delivery?', a: 'Payments are released via Smart SecurePay once the buyer confirms delivery. Funds reach your M-PESA wallet within 2 minutes of release — 24/7.' },
      { q: 'What does "Grade A" vs "Grade B" mean?', a: 'Grade A is top-quality produce meeting ShambaPoint standards (minimal bruising, correct moisture, uniform size). Grade B has minor imperfections but is still sellable. Your listed grade must match what you deliver.' },
      { q: 'How do I dispute a rejected delivery?', a: 'Call the Farmer Hotline at +254 700 111 222 with your Order ID. Our field officer will conduct a physical inspection within 24 hours.' },
      { q: 'Can I book cold storage directly?', a: 'Yes — go to Storage in your dashboard. Select a facility near your county, choose duration, and pay via M-PESA. IoT temperature monitoring starts immediately.' },
    ],
  },
  buyer: {
    label: 'Buyer Support',
    icon: ShoppingBag,
    color: 'from-blue-800 to-blue-950',
    accent: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    contacts: [
      { label: 'Buyer Support Desk (24/7)',   number: '+254 700 222 333', icon: Phone,   note: 'Orders, deliveries, refunds' },
      { label: 'Corporate Procurement Line',  number: '+254 711 444 555', icon: Phone,   note: 'Bulk orders, contracts, invoicing' },
      { label: 'Quality Assurance Team',      number: '+254 722 666 777', icon: Phone,   note: 'Grade disputes, produce inspection requests' },
      { label: 'Email Support',               number: 'buyers@shambapoint.co.ke', icon: Mail, note: 'Non-urgent queries, documentation' },
    ],
    faqs: [
      { q: 'How does Smart SecurePay protect my money?', a: 'When you place an order, your payment is locked in escrow. Funds are only released to the farmer after YOU confirm that the produce arrived in the correct grade and quantity. Your money is safe at all times.' },
      { q: 'What if my produce arrives damaged or wrong grade?', a: 'Reject delivery in the app within 12 hours and call +254 700 222 333. We will arrange a re-delivery or full refund — whichever you prefer.' },
      { q: 'Can I place bulk corporate orders?', a: 'Yes. Call our Corporate Procurement Line at +254 711 444 555 to set up a standing purchase order with weekly or monthly delivery schedules and volume discounts.' },
      { q: 'How do I track my delivery?', a: 'Go to My Orders → select the order → click "Track Live". You will see real-time GPS location, cargo temperature, and estimated arrival time.' },
      { q: 'Can I pay via bank transfer instead of M-PESA?', a: 'Yes — bank and Pesalink transfers are supported for orders over KSh 50,000. Contact the Buyer Support Desk to arrange.' },
    ],
  },
  logistics: {
    label: 'Logistics Support',
    icon: Truck,
    color: 'from-amber-700 to-amber-900',
    accent: 'text-ag-amber',
    badge: 'bg-amber-100 text-amber-700',
    contacts: [
      { label: 'Driver Operations (24/7)',   number: '+254 700 333 444', icon: Phone,   note: 'Trip assignments, route changes, emergencies' },
      { label: 'Fleet Manager Direct Line',  number: '+254 711 555 666', icon: Phone,   note: 'Vehicle breakdowns, replacements' },
      { label: 'Earnings & Payments',        number: '+254 722 777 888', icon: Phone,   note: 'Wallet issues, M-PESA payouts, disputes' },
      { label: 'Email Support',              number: 'drivers@shambapoint.co.ke', icon: Mail, note: 'Documents, vehicle registration, KYC' },
    ],
    faqs: [
      { q: 'How are trip earnings calculated?', a: 'Earnings are based on distance (KSh/km rate × route km) plus a cargo-weight bonus for loads over 500 kg. Rates are shown before you accept each trip. Payments hit your wallet within 30 minutes of delivery confirmation.' },
      { q: 'What do I do if my vehicle breaks down mid-trip?', a: 'Call the Fleet Manager Direct Line at +254 711 555 666 immediately. We will dispatch a replacement vehicle and you will still receive partial payment for the completed portion of the trip.' },
      { q: 'How do I update my available/on-trip status?', a: 'Go to your Dashboard → Moderation section. Click "Toggle Status" to switch between Available and On Trip. Buyers and the platform see your real-time status.' },
      { q: 'What is the cold-chain monitoring system?', a: 'IoT sensors in partner vehicles track temperature, humidity, and GPS in real-time. You will receive alerts if temperature goes outside safe ranges for the cargo type, helping you avoid produce loss.' },
      { q: 'How do I withdraw my wallet earnings?', a: 'Go to Dashboard → Wallet → "Withdraw to M-PESA". Minimum withdrawal is KSh 500. Funds arrive instantly, 24/7. For amounts over KSh 70,000 call +254 722 777 888.' },
    ],
  },
  admin: {
    label: 'Admin Support',
    icon: Shield,
    color: 'from-purple-800 to-purple-950',
    accent: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700',
    contacts: [
      { label: 'Platform Engineering',      number: '+254 700 999 000', icon: Phone,   note: 'System issues, outages, API errors' },
      { label: 'Compliance & Legal',        number: '+254 711 000 111', icon: Phone,   note: 'KYC escalations, legal holds, sanctions' },
      { label: 'Operations Centre',         number: '+254 722 111 222', icon: Phone,   note: 'Fraud alerts, escalations, live disputes' },
      { label: 'Admin Email',               number: 'admin@shambapoint.co.ke', icon: Mail, note: 'Reports, audit requests, data exports' },
    ],
    faqs: [
      { q: 'How do I approve KYC for a new farmer?', a: 'Go to the Users tab → find the user with "pending_kyc" status → click "Approve KYC". The user is immediately activated and can list produce.' },
      { q: 'How do I suspend a user account?', a: 'In the Users tab, click "View" on the user → click "Suspend". The user loses access immediately and receives an automated SMS. Document the reason in the audit log.' },
      { q: 'How do I handle a disputed payment?', a: 'Go to Orders tab, find the flagged order. Use the status dropdown to update. For complex disputes, call the Operations Centre at +254 722 111 222 — they have override access.' },
      { q: 'How do I enable Maintenance Mode?', a: 'Go to Admin Settings tab → toggle Maintenance Mode ON. All user-facing routes will show a maintenance page. Always notify users via SMS blast before enabling.' },
      { q: 'How do I export user data?', a: 'In the Users tab, click "Export CSV". For full database exports or GDPR data-subject requests, contact admin@shambapoint.co.ke with the request details.' },
    ],
  },
};

/* ── Shared generic FAQs ─────────────────────────────────── */
const GENERAL_FAQS = [
  { q: 'What is ShambaPoint AgriTech?', a: 'ShambaPoint is a farm-to-buyer marketplace that connects Kenyan farmers directly to retailers, supermarkets, and individual buyers — cutting out middlemen and ensuring fair prices for both sides.' },
  { q: 'How does M-PESA payment work?', a: 'Enter your Safaricom number at checkout. You will receive an STK push prompt on your phone. Approve it and payment is confirmed instantly. We use the official Safaricom Daraja API — your PIN is never shared with us.' },
  { q: 'Is ShambaPoint available across Kenya?', a: 'Yes — we currently serve 10 counties: Nairobi, Kiambu, Nakuru, Meru, Uasin Gishu, Kajiado, Nyandarua, Kericho, Kakamega, and Kisumu. More counties are launching in Q3 2026.' },
];

/* ── FAQ Accordion ───────────────────────────────────────── */
const FaqItem = ({ faq, accent }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-ag-border rounded-xl overflow-hidden transition-shadow ${open ? 'shadow-md' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-ag-canvas transition-colors gap-3"
      >
        <span className="font-bold text-ag-body text-sm">{faq.q}</span>
        {open
          ? <ChevronUp className={`w-4 h-4 shrink-0 ${accent}`} />
          : <ChevronDown className="w-4 h-4 shrink-0 text-ag-muted" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-ag-canvas border-t border-ag-border">
          <p className="text-sm text-ag-muted leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function HelpCenter() {
  const [search, setSearch] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');

  /* Detect role from localStorage */
  const role = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'farmer'; } catch { return 'farmer'; }
  })();

  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.farmer;
  const Icon = cfg.icon;

  const allFaqs  = [...cfg.faqs, ...GENERAL_FAQS];
  const filtered = search
    ? allFaqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : allFaqs;

  const submitTicket = () => {
    if (!ticketMsg.trim()) return;
    setTicketSent(true);
    setTicketMsg('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in">

      {/* ── HERO ── */}
      <div className={`bg-gradient-to-br ${cfg.color} rounded-2xl p-8 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 right-10 w-40 h-40 border-2 border-white rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 border border-white rounded-full" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">{cfg.label}</p>
            <h1 className="text-2xl font-black mb-2">How can we help you?</h1>
            <p className="text-sm text-white/70">
              Find answers, contact our team, or submit a support ticket below.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your question..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3 pl-12
              text-white placeholder-white/50 text-sm font-medium focus:outline-none
              focus:bg-white/20 transition-colors"
          />
        </div>
      </div>

      {/* ── CONTACT CARDS ── */}
      <div>
        <h2 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
          <Phone className="w-4 h-4 text-ag-primary" /> Contact Us
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cfg.contacts.map((c, i) => {
            const CIcon = c.icon;
            const isMail = c.icon === Mail;
            return (
              <div key={i} className="bg-white border border-ag-border rounded-2xl p-5
                hover:shadow-md transition-shadow flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.badge}`}>
                  <CIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ag-muted uppercase tracking-wide mb-1">{c.label}</p>
                  {isMail ? (
                    <a href={`mailto:${c.number}`} className={`font-extrabold text-sm ${cfg.accent} hover:underline block`}>
                      {c.number}
                    </a>
                  ) : (
                    <a href={`tel:${c.number.replace(/\s/g, '')}`} className={`font-extrabold text-base ${cfg.accent} hover:underline block`}>
                      {c.number}
                    </a>
                  )}
                  <p className="text-xs text-ag-muted mt-1">{c.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── HOURS BANNER ── */}
      <div className="bg-ag-canvas border border-ag-border rounded-2xl px-6 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-ag-pay rounded-full animate-pulse" />
          <span className="text-xs font-bold text-ag-pay uppercase tracking-wider">Support Online</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-ag-muted flex-wrap gap-y-1">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Phone: Mon–Sun 6 AM – 10 PM EAT</span>
          <span className="text-ag-border">|</span>
          <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WhatsApp & Email: 24/7</span>
        </div>
      </div>

      {/* ── FAQ SECTION ── */}
      <div>
        <h2 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-ag-primary" /> Frequently Asked Questions
          {search && <span className="text-xs font-bold text-ag-muted">({filtered.length} results)</span>}
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-ag-border mx-auto mb-3" />
            <p className="font-bold text-ag-muted">No FAQs match your search.</p>
            <p className="text-sm text-ag-muted mt-1">Try calling our support line instead.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((faq, i) => (
              <FaqItem key={i} faq={faq} accent={cfg.accent} />
            ))}
          </div>
        )}
      </div>

      {/* ── SUPPORT TICKET ── */}
      <div className="bg-white border border-ag-border rounded-2xl p-6">
        <h2 className="font-extrabold text-ag-body mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-ag-primary" /> Submit a Support Ticket
        </h2>
        <p className="text-xs text-ag-muted mb-4">Didn't find your answer? We'll get back to you within 2 hours.</p>

        {ticketSent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-ag-pay" />
            <p className="font-extrabold text-ag-body">Ticket submitted!</p>
            <p className="text-sm text-ag-muted">Our {cfg.label} team will contact you soon.</p>
            <button onClick={() => setTicketSent(false)} className="btn-secondary !min-h-0 !py-2 !text-xs mt-2">
              Submit another
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <textarea
              value={ticketMsg}
              onChange={e => setTicketMsg(e.target.value)}
              rows={4}
              placeholder="Describe your issue in detail — include your Order ID or Phone number if relevant..."
              className="form-input resize-none text-sm"
            />
            <button
              onClick={submitTicket}
              disabled={!ticketMsg.trim()}
              className="btn-primary w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Ticket <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
