import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Search, Phone, Send,
  CheckCheck, Lock, Unlock
} from 'lucide-react';

const CONTACTS = [
  { id: 1, name: 'James Mwangi', role: 'Farmer', county: 'Nakuru', crop: 'Maize', phone: '0712345678', whatsapp: '254712345678', online: true, unread: 2, lastMsg: 'Is the maize still available?', time: '10:32 AM', avatar: 'JM', verified: true },
  { id: 2, name: 'Mary Akinyi', role: 'Farmer', county: 'Kisumu', crop: 'Tomatoes', phone: '0723456789', whatsapp: '254723456789', online: false, unread: 0, lastMsg: 'I can deliver on Friday.', time: 'Yesterday', avatar: 'MA', verified: true },
  { id: 3, name: 'Peter Kibet', role: 'Farmer', county: 'Eldoret', crop: 'Beans', phone: '0734567890', whatsapp: '254734567890', online: true, unread: 5, lastMsg: 'Price is negotiable for bulk.', time: '9:15 AM', avatar: 'PK', verified: false },
  { id: 4, name: 'Grace Njoroge', role: 'Farmer', county: 'Limuru', crop: 'Spinach', phone: '0745678901', whatsapp: '254745678901', online: false, unread: 0, lastMsg: 'Thank you for your order!', time: 'Mon', avatar: 'GN', verified: true },
  { id: 5, name: 'David Otieno', role: 'Buyer', county: 'Nairobi', crop: 'All crops', phone: '0756789012', whatsapp: '254756789012', online: true, unread: 1, lastMsg: 'Can you do 50 bags?', time: '8:50 AM', avatar: 'DO', verified: false },
];

const MOCK_CHATS = {
  1: [
    { id: 1, from: 'them', text: 'Hello! I saw your maize listing on ShambaPoint.', time: '10:20 AM' },
    { id: 2, from: 'me', text: 'Yes, I have 50 bags of Grade A maize available.', time: '10:22 AM' },
    { id: 3, from: 'them', text: 'Is the maize still available?', time: '10:32 AM' },
    { id: 4, from: 'them', text: 'I need it before Friday.', time: '10:32 AM' },
  ],
  2: [
    { id: 1, from: 'me', text: 'Hi Mary, I placed an order for 300kg tomatoes.', time: 'Yesterday' },
    { id: 2, from: 'them', text: 'I can deliver on Friday.', time: 'Yesterday' },
  ],
  3: [
    { id: 1, from: 'them', text: 'Price is negotiable for bulk.', time: '9:15 AM' },
    { id: 2, from: 'them', text: 'Minimum 10 bags for discounted rate.', time: '9:16 AM' },
    { id: 3, from: 'them', text: 'Are you interested?', time: '9:20 AM' },
    { id: 4, from: 'them', text: 'I also have groundnuts.', time: '9:21 AM' },
    { id: 5, from: 'them', text: 'Check my profile for more produce.', time: '9:22 AM' },
  ],
};

export default function MessagesPage() {
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [chats, setChats] = useState(MOCK_CHATS);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [privacyMode, setPrivacyMode] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected, chats]);

  const messages = chats[selected?.id] || [];
  const filtered = CONTACTS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.crop.toLowerCase().includes(search.toLowerCase())
  );

  const send = () => {
    if (!input.trim() || !selected) return;
    const msg = { id: Date.now(), from: 'me', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChats(prev => ({ ...prev, [selected.id]: [...(prev[selected.id] || []), msg] }));
    setInput('');
  };

  const maskPhone = (phone) => privacyMode ? phone.replace(/\d(?=\d{4})/g, '*') : phone;

  return (
    <div className="ag-card !p-0 overflow-hidden animate-slide-up" style={{ height: 'calc(100vh - 160px)', minHeight: 500 }}>
      <div className="flex h-full">

        {/* ── CONTACT LIST ── */}
        <div className="w-72 shrink-0 border-r border-ag-border flex flex-col">
          <div className="p-4 border-b border-ag-border">
            <h3 className="font-extrabold text-ag-body mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-ag-primary" /> Messages
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ag-outline" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="form-input !pl-9 !py-2 !text-sm" placeholder="Search contacts…" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-ag-border">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-left px-4 py-3 hover:bg-ag-canvas transition-colors
                  ${selected?.id === c.id ? 'bg-ag-primary-fixed' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-ag-primary flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                      {c.avatar}
                    </div>
                    {c.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-ag-body text-sm truncate">{c.name}</p>
                      <span className="text-[10px] text-ag-muted">{c.time}</span>
                    </div>
                    <p className="text-xs text-ag-muted truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 bg-ag-amber rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── CHAT AREA ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {selected ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-ag-border flex items-center gap-4 bg-white">
                <div className="w-10 h-10 rounded-full bg-ag-primary flex items-center justify-center text-white text-xs font-extrabold">
                  {selected.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-ag-body">{selected.name}</p>
                    {selected.verified && (
                      <span className="chip-verified text-[9px] !px-1.5">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-ag-muted">
                    {selected.crop} · {selected.county} ·{' '}
                    <span className={selected.online ? 'text-green-500' : 'text-ag-muted'}>
                      {selected.online ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <a href={`tel:${selected.phone}`}
                    className="btn-ghost !py-2 !px-3 !text-xs text-green-700 border-green-300 hover:bg-green-50">
                    <Phone className="w-3.5 h-3.5" /> {maskPhone(selected.phone)}
                  </a>
                  <a href={`https://wa.me/${selected.whatsapp}`} target="_blank" rel="noreferrer"
                    className="btn-ghost !py-2 !px-3 !text-xs text-green-600 border-green-300 hover:bg-green-50">
                    <span className="text-sm">📱</span> WhatsApp
                  </a>
                  <a href={`sms:${selected.phone}`}
                    className="btn-ghost !py-2 !px-3 !text-xs">
                    SMS
                  </a>
                  <button onClick={() => setPrivacyMode(v => !v)}
                    className={`btn-ghost !py-2 !px-3 !text-xs ${privacyMode ? 'text-ag-amber' : 'text-green-600'}`}
                    title="Privacy mode — hides phone numbers until order confirmed">
                    {privacyMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Privacy banner */}
              {privacyMode && (
                <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-800 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" />
                  Privacy Mode ON — phone numbers hidden until order is confirmed.
                  <button onClick={() => setPrivacyMode(false)} className="underline ml-1">Disable</button>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-ag-canvas">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={m.from === 'me' ? 'chat-bubble-sent' : 'chat-bubble-recv'}>
                      <p>{m.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1
                        ${m.from === 'me' ? 'text-white/60' : 'text-ag-muted'} text-[10px]`}>
                        <span>{m.time}</span>
                        {m.from === 'me' && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Quick reply suggestions */}
              <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-ag-border bg-white">
                {['Is produce still available?','Can you negotiate price?','When can you deliver?','Can I visit the farm?','Request more photos'].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="shrink-0 text-xs bg-ag-surface text-ag-body px-3 py-1.5 rounded-full
                      hover:bg-ag-primary hover:text-white transition-colors whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-ag-border bg-white flex gap-3 items-center">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  className="form-input flex-1 !py-2.5 !text-sm"
                  placeholder="Type a message…" />
                <button onClick={send} disabled={!input.trim()} className="btn-primary !min-h-0 !py-2.5 !px-4">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-ag-muted">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-bold">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
