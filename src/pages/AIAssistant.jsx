import { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, TrendingUp, TrendingDown, AlertTriangle,
  Zap, BarChart2, Target, Sparkles, MessageSquare, Calendar, ShieldCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

/* ── MOCK AI DATA ───────────────────────────────────────── */
const PRICE_DATA = [
  { month: 'Jan', maize: 3800, beans: 7200, tomatoes: 6000 },
  { month: 'Feb', maize: 3600, beans: 7800, tomatoes: 5500 },
  { month: 'Mar', maize: 4100, beans: 8200, tomatoes: 7200 },
  { month: 'Apr', maize: 4300, beans: 7600, tomatoes: 9100 },
  { month: 'May', maize: 4800, beans: 8100, tomatoes: 8400 },
  { month: 'Jun', maize: 4500, beans: 8900, tomatoes: 7600 },
  { month: 'Jul', maize: 5200, beans: 9200, tomatoes: 8800 },
];

const YIELD_DATA = [
  { county: 'Nakuru', maize: 42, beans: 18, wheat: 31 },
  { county: 'Eldoret', maize: 55, beans: 22, wheat: 44 },
  { county: 'Kisumu', maize: 38, beans: 16, wheat: 19 },
  { county: 'Meru', maize: 46, beans: 27, wheat: 35 },
  { county: 'Kisii', maize: 39, beans: 21, wheat: 22 },
];

const DEMAND_DATA = [
  { week: 'W1', demand: 78 },
  { week: 'W2', demand: 85 },
  { week: 'W3', demand: 92 },
  { week: 'W4', demand: 88 },
  { week: 'W5', demand: 95 },
  { week: 'W6', demand: 102 },
];

const PREDICTIONS = [
  {
    crop: 'Maize', currentPrice: 4500, predictedPrice: 5200, direction: 'up',
    confidence: 87, reason: 'Dry spell forecast + high NCPB procurement demand',
    plantingDate: '15 Mar', bestMarket: 'Eldoret Grain Market',
    disease: 'Low risk', pest: 'Stem borer alert (moderate)',
    fertilizer: 'DAP 50kg/acre at planting, CAN 50kg top-dress at 6 weeks',
    irrigation: 'Rain-fed adequate; supplement if < 30mm/week',
  },
  {
    crop: 'Tomatoes', currentPrice: 80, predictedPrice: 65, direction: 'down',
    confidence: 74, reason: 'High supply expected from Meru and Kirinyaga counties',
    plantingDate: '1 Apr', bestMarket: 'Wakulima Market Nairobi',
    disease: 'Blight risk HIGH — spray fungicide now',
    pest: 'Aphid alert — use neem oil spray',
    fertilizer: 'CAN 30kg/acre weekly; foliar feed weekly',
    irrigation: 'Drip irrigation 3x per week recommended',
  },
  {
    crop: 'Beans', currentPrice: 8900, predictedPrice: 9800, direction: 'up',
    confidence: 91, reason: 'Export demand from Uganda + domestic MSME buyers increasing',
    plantingDate: '10 Mar', bestMarket: 'Nakuru Farmers Market',
    disease: 'Bean rust moderate — monitor weekly',
    pest: 'Weevils in storage — use phosphine tablets',
    fertilizer: 'Rhizobium inoculant + TSP 30kg/acre',
    irrigation: 'Minimal — drought tolerant variety recommended',
  },
];

/* ── BOT RESPONSES ──────────────────────────────────────── */
const BOT_RESPONSES = {
  default: "I'm your AI Farming Assistant 🤖. Ask me about crop prices, planting dates, pest control, storage, or market demand!",
  price: "📈 Based on current market trends: **Maize** is expected to rise to KSh 5,200/bag by August (87% confidence). **Beans** show strong demand — KSh 9,800/90kg bag projected. **Tomatoes** may dip due to oversupply — consider delayed planting.",
  plant: "📅 **Optimal Planting Calendar (Kenya 2026)**:\n• Maize: March 15 – April 10 (Long Rains)\n• Beans: March 10 – April 5\n• Tomatoes: March 1 – April 1\n• Potatoes: September (Short Rains)\n• Wheat: October – November",
  pest: "🐛 **Current Pest Alerts**:\n• Stem Borer in Maize — moderate risk in Rift Valley. Apply cypermethrin.\n• Aphids on Tomatoes — spray neem oil early morning.\n• Weevils in stored beans — use phosphine fumigation tablets.\n• Fall Armyworm — high alert in Western Kenya.",
  fertilizer: "🌱 **Fertilizer Recommendations**:\n• Maize: DAP 50kg/acre at planting + CAN 50kg at 6 weeks\n• Beans: Rhizobium inoculant + TSP 30kg/acre (no nitrogen needed)\n• Tomatoes: CAN 30kg/acre + foliar NPK weekly\n• Potatoes: DSP 100kg/acre + CAN 60kg/acre",
  storage: "📦 **AI Storage Tips**:\n• Maize: Store at 13% moisture in hermetic bags. Prevents aflatoxin.\n• Beans: Metal silos at 12% moisture prevent weevils.\n• Tomatoes: 10-13°C cold storage, check daily.\n• Potatoes: Dark cold rooms at 4-7°C.",
  weather: "🌤 **Weather Forecast (Next 14 Days)**:\nNakuru: 22°C avg, 45mm rainfall expected — good for maize\nKisumu: 28°C, high humidity — watch for blight\nNairobi: 19°C, moderate rainfall — ideal for vegetables\n\nIrrigation: Supplement where rainfall < 30mm/week",
  fraud: "🛡 **Fraud Detection Alert**:\n• 2 buyer accounts flagged for suspicious ordering patterns\n• 1 farmer listing shows inconsistent harvest dates — under review\n• Always use Smart SecurePay escrow — never pay directly to unverified contacts",
  market: "📊 **Market Demand Predictions**:\n• Highest demand: Nakuru, Eldoret, Nairobi markets\n• Bulk buyers active this month: Naivas, Quickmart, Carrefour\n• Export opportunity: Uganda beans, Tanzania maize\n• Best time to sell: Early morning market hours (6-9 AM)",
};

const getResponse = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes('price') || m.includes('sell') || m.includes('cost')) return BOT_RESPONSES.price;
  if (m.includes('plant') || m.includes('when') || m.includes('date') || m.includes('calendar')) return BOT_RESPONSES.plant;
  if (m.includes('pest') || m.includes('insect') || m.includes('bug') || m.includes('worm')) return BOT_RESPONSES.pest;
  if (m.includes('fertiliz') || m.includes('npk') || m.includes('dap') || m.includes('nutrient')) return BOT_RESPONSES.fertilizer;
  if (m.includes('stor') || m.includes('bag') || m.includes('silo') || m.includes('moisture')) return BOT_RESPONSES.storage;
  if (m.includes('weather') || m.includes('rain') || m.includes('forecast') || m.includes('irrigat')) return BOT_RESPONSES.weather;
  if (m.includes('fraud') || m.includes('fake') || m.includes('scam') || m.includes('safe')) return BOT_RESPONSES.fraud;
  if (m.includes('market') || m.includes('demand') || m.includes('buy') || m.includes('where')) return BOT_RESPONSES.market;
  return BOT_RESPONSES.default;
};

/* ── CHATBOT ────────────────────────────────────────────── */
const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: BOT_RESPONSES.default, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const quickQ = ['Crop prices?', 'Planting dates?', 'Pest alerts?', 'Fertilizer advice?', 'Weather forecast?'];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text, time: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'bot', text: getResponse(text), time: new Date() }]);
    }, 1200);
  };

  return (
    <div className="ag-card !p-0 flex flex-col h-[400px]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-ag-border bg-ag-primary rounded-t-card">
        <div className="w-9 h-9 bg-ag-amber rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-white text-sm">ShambaBot AI</p>
          <p className="text-ag-primary-fixed text-xs">Your Agricultural Advisor • Online</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse-soft" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'bot' && (
              <div className="w-7 h-7 bg-ag-primary rounded-full flex items-center justify-center shrink-0 mr-2 mt-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={m.role === 'user' ? 'chat-bubble-sent' : 'chat-bubble-recv'}>
              <p className="whitespace-pre-line text-sm">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-white/60' : 'text-ag-muted'}`}>
                {m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-ag-primary rounded-full flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="chat-bubble-recv flex items-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-ag-muted rounded-full animate-bounce-sm"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-ag-border bg-ag-canvas">
        {quickQ.map(q => (
          <button key={q} onClick={() => send(q)}
            className="shrink-0 bg-ag-surface text-ag-body text-xs font-semibold px-3 py-1.5
              rounded-full hover:bg-ag-primary hover:text-white transition-colors whitespace-nowrap cursor-pointer">
            {q}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-ag-border flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
          className="form-input !py-2.5 !text-sm flex-1"
          placeholder="Ask ShambaBot anything about farming…"
        />
        <button onClick={() => send(input)} disabled={!input.trim()}
          className="btn-primary !min-h-0 !py-2.5 !px-4 !text-sm cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ── PREDICTION CARD ────────────────────────────────────── */
const PredCard = ({ p }) => (
  <div className="ag-card flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="font-extrabold text-ag-body text-lg">{p.crop}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={p.direction === 'up' ? 'ai-confidence-high' : 'ai-confidence-low'}>
            {p.confidence}% confidence
          </span>
        </div>
      </div>
      <div className={`flex items-center gap-1 font-extrabold text-lg
        ${p.direction === 'up' ? 'text-green-600' : 'text-red-500'}`}>
        {p.direction === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        KSh {p.predictedPrice.toLocaleString()}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 text-xs">
      {[
        ['Current Price', `KSh ${p.currentPrice.toLocaleString()}`],
        ['Best Market', p.bestMarket],
        ['Plant Date', p.plantingDate],
        ['Disease Risk', p.disease],
      ].map(([k, v]) => (
        <div key={k} className="bg-ag-surface rounded-btn p-2">
          <p className="text-ag-muted font-bold uppercase tracking-wide text-[10px]">{k}</p>
          <p className="font-semibold text-ag-body mt-0.5 leading-snug">{v}</p>
        </div>
      ))}
    </div>

    <div className="text-xs bg-blue-50 border border-blue-100 rounded-btn p-2.5 dark:bg-blue-950/40 dark:border-blue-900/30">
      <span className="font-bold text-blue-800 dark:text-blue-300">🤖 Reason:</span>
      <span className="text-blue-700 dark:text-blue-400 ml-1">{p.reason}</span>
    </div>

    <div className="text-xs text-ag-muted">
      <p><span className="font-bold text-ag-body">🌱 Fertilizer:</span> {p.fertilizer}</p>
      <p className="mt-1"><span className="font-bold text-ag-body">💧 Irrigation:</span> {p.irrigation}</p>
      <p className="mt-1"><span className="font-bold text-ag-body">🐛 Pest:</span> {p.pest}</p>
    </div>
  </div>
);

/* ── MAIN PAGE ──────────────────────────────────────────── */
export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState('Price Predictions');

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* Header */}
      <div className="amber-gradient rounded-xl2 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-xl">AI Crop Assistant</h2>
            <p className="text-white/70 text-sm">Powered by Machine Learning · Kenya Agricultural Data</p>
          </div>
        </div>
        
        {/* Pressable Interactive Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Price Predictions', 'Yield Forecast', 'Pest Detection', 'Planting Calendar', 'Fraud Detection'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs font-bold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                activeTab === t
                  ? 'bg-white text-ag-primary shadow-md scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              ✓ {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="transition-all duration-300">
        
        {/* PRICE PREDICTIONS TAB */}
        {activeTab === 'Price Predictions' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Trend */}
              <div className="ag-card">
                <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-ag-pay" /> Price Trend Forecast (KSh/90kg)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={PRICE_DATA}>
                    <defs>
                      <linearGradient id="maizeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="beansGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#904D00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#904D00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`KSh ${v.toLocaleString()}`, '']} />
                    <Area type="monotone" dataKey="maize"   stroke="#4CAF50" fill="url(#maizeGrad)" strokeWidth={2} name="Maize" />
                    <Area type="monotone" dataKey="beans"   stroke="#904D00" fill="url(#beansGrad)" strokeWidth={2} name="Beans" />
                    <Area type="monotone" dataKey="tomatoes" stroke="#3B82F6" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Tomatoes" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {[['#4CAF50','Maize'],['#904D00','Beans'],['#3B82F6','Tomatoes']].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5 text-xs text-ag-muted">
                      <div className="w-3 h-0.5 rounded-full" style={{background:c}} />
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand Forecast */}
              <div className="ag-card">
                <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-ag-amber" /> Market Demand Index
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={DEMAND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#FE932C" radius={[4,4,0,0]} name="Demand Index" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-ag-muted mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  Demand up 31% over 6 weeks — best time to list produce
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-ag-primary" /> AI Price & Yield Predictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PREDICTIONS.map(p => <PredCard key={p.crop} p={p} />)}
              </div>
            </div>
          </div>
        )}

        {/* YIELD FORECAST TAB */}
        {activeTab === 'Yield Forecast' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Yield Chart */}
              <div className="ag-card lg:col-span-2">
                <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-ag-primary" /> County Crop Yield Forecast (bags/acre)
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={YIELD_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E5" />
                    <XAxis dataKey="county" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="maize" fill="#4CAF50" radius={[4,4,0,0]} name="Maize" />
                    <Bar dataKey="beans" fill="#904D00" radius={[4,4,0,0]} name="Beans" />
                    <Bar dataKey="wheat" fill="#3B82F6" radius={[4,4,0,0]} name="Wheat" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  {[['#4CAF50','Maize'],['#904D00','Beans'],['#3B82F6','Wheat']].map(([c,l]) => (
                    <div key={l} className="flex items-center gap-1.5 text-xs text-ag-muted">
                      <div className="w-3 h-0.5 rounded-full" style={{background:c}} />
                      {l}
                    </div>
                  ))}
                </div>
              </div>

              {/* Yield Insights */}
              <div className="ag-card flex flex-col gap-4 justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-ag-body mb-3 uppercase tracking-wider">AI Yield Insights</h4>
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-btn p-3 dark:bg-green-950/20 dark:border-green-900/30">
                      <p className="text-xs font-bold text-green-800 dark:text-green-300">🌾 Eldoret Leading</p>
                      <p className="text-[11px] text-green-700 dark:text-green-400 mt-0.5">Eldoret county shows peak yields of Maize (55 bags/acre) and Wheat (44 bags/acre) due to favorable soil composition.</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-btn p-3 dark:bg-blue-950/20 dark:border-blue-900/30">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-300">🌱 Meru Beans Dominating</p>
                      <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Meru County yields highest beans index (27 bags/acre) due to organic farming adoption.</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-ag-border pt-3 text-[11px] text-ag-muted">
                  📊 Forecast models trained on KARI & regional farming agency records (2020-2025).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PEST DETECTION TAB */}
        {activeTab === 'Pest Detection' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Stem Borer', crop: 'Maize', risk: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100', details: 'Rift Valley and central regions. Apply cypermethrin early morning.' },
                { name: 'Tomato Blight', crop: 'Tomatoes', risk: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-100', details: 'Fungal spores active due to high humidity. Spray fungicide immediately.' },
                { name: 'Bean Rust', crop: 'Beans', risk: 'Low', color: 'text-green-600', bg: 'bg-green-50 border-green-100', details: 'Foliar rust spots reported in Meru. Monitor weekly; spray neem oil if spread increases.' },
                { name: 'Fall Armyworm', crop: 'Maize', risk: 'High', color: 'text-red-600', bg: 'bg-red-50 border-red-100', details: 'Infestations in Western Kenya. Set pheromone traps and use recommended bio-pesticides.' },
              ].map(pest => (
                <div key={pest.name} className={`ag-card border ${pest.bg} flex flex-col justify-between h-full`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-ag-muted bg-white px-2 py-0.5 rounded-full border border-ag-border">{pest.crop}</span>
                      <span className={`text-xs font-extrabold ${pest.color}`}>{pest.risk} Risk</span>
                    </div>
                    <h4 className="font-extrabold text-ag-body text-base">{pest.name}</h4>
                    <p className="text-xs text-ag-muted mt-2 leading-relaxed">{pest.details}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-1.5 text-xs text-ag-body font-bold">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> Action Required
                  </div>
                </div>
              ))}
            </div>

            {/* Diagnostic helper */}
            <div className="ag-card border-2 border-dashed border-ag-border flex flex-col items-center justify-center p-8 text-center bg-ag-surface">
              <Bot className="w-10 h-10 text-ag-primary mb-3" />
              <h4 className="font-extrabold text-ag-body text-base">Instant AI Pest Diagnosis</h4>
              <p className="text-xs text-ag-muted max-w-md mt-1 leading-relaxed">Upload a clear photo of your affected crop leaves. Our neural network will analyze symptoms to identify diseases, nutrient deficiencies, or pests in seconds.</p>
              <button className="btn-primary mt-4 !px-6 !py-2.5 text-xs cursor-pointer">
                📷 Upload Leaf Photo
              </button>
            </div>
          </div>
        )}

        {/* PLANTING CALENDAR TAB */}
        {activeTab === 'Planting Calendar' && (
          <div className="flex flex-col gap-6">
            <div className="ag-card">
              <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ag-primary" /> Kenya 2026 Optimal Planting Calendar
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-ag-surface text-ag-muted uppercase font-bold tracking-wider border-b border-ag-border">
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4">Long Rains (Mar-May)</th>
                      <th className="py-3 px-4">Short Rains (Oct-Dec)</th>
                      <th className="py-3 px-4">Harvest Window</th>
                      <th className="py-3 px-4">Water Needs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ag-border">
                    {[
                      { crop: 'Maize', long: 'March 15 – April 10', short: 'October 1 – October 20', harvest: 'August – September', water: '30-40mm/week' },
                      { crop: 'Beans', long: 'March 10 – April 5', short: 'October 5 – October 25', harvest: 'June – July', water: '20-25mm/week' },
                      { crop: 'Tomatoes', long: 'March 1 – April 1', short: 'September 15 – October 10', harvest: 'May – July (Continual)', water: 'Irrigated / Drip' },
                      { crop: 'Potatoes', long: 'April 1 – April 20', short: 'September 1 – September 20', harvest: 'July – August', water: '35-45mm/week' },
                      { crop: 'Wheat', long: 'Not recommended', short: 'October 15 – November 15', harvest: 'February – March', water: '25-30mm/week' },
                    ].map(row => (
                      <tr key={row.crop} className="hover:bg-ag-surface/50">
                        <td className="py-3 px-4 font-bold text-ag-body">{row.crop}</td>
                        <td className="py-3 px-4 text-ag-muted">{row.long}</td>
                        <td className="py-3 px-4 text-ag-muted">{row.short}</td>
                        <td className="py-3 px-4 text-ag-primary font-semibold">{row.harvest}</td>
                        <td className="py-3 px-4 text-ag-body">{row.water}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FRAUD DETECTION TAB */}
        {activeTab === 'Fraud Detection' && (
          <div className="flex flex-col gap-6">
            <div className="ag-card border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/30">
              <h3 className="font-extrabold text-ag-body mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" /> AI Fraud & Security Shield
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Suspicious Buyers Flagged', value: 2, color: 'text-red-600', bg: 'bg-red-100', note: 'Pattern: place orders + cancel before delivery' },
                  { label: 'Fake Listings Detected', value: 1, color: 'text-orange-600', bg: 'bg-orange-100', note: 'Inconsistent harvest dates on listing' },
                  { label: 'Fraud Risk Score', value: 'Low', color: 'text-green-600', bg: 'bg-green-100', note: 'Platform overall fraud risk is LOW' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-card p-4 dark:bg-ag-card">
                    <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="font-bold text-ag-body text-sm">{s.label}</p>
                    <p className="text-xs text-ag-muted mt-1">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flagged Incidents Log */}
              <div className="ag-card">
                <h4 className="font-extrabold text-ag-body text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Flagged Incidents Log (Real-time)
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="bg-ag-surface p-3 rounded-btn border border-ag-border flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ag-body">Account Under Review: @buyer_karanja</p>
                      <p className="text-[11px] text-ag-muted mt-0.5">Placed 4 high-value maize orders in 30 minutes to different locations. Escrow payment not initialized.</p>
                      <span className="text-[10px] text-ag-muted bg-white px-2 py-0.5 rounded border border-ag-border mt-2 inline-block">Flagged today 11:24 AM</span>
                    </div>
                  </div>
                  <div className="bg-ag-surface p-3 rounded-btn border border-ag-border flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ag-body">Suspicious Listing: Harvest Date Anomaly</p>
                      <p className="text-[11px] text-ag-muted mt-0.5">Tomato listing in Nakuru posted harvest date set to November 2026. Auto-flagged for review.</p>
                      <span className="text-[10px] text-ag-muted bg-white px-2 py-0.5 rounded border border-ag-border mt-2 inline-block">Flagged yesterday</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure transaction guidelines */}
              <div className="ag-card flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-ag-body text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Safe Escrow Policy
                  </h4>
                  <p className="text-xs text-ag-muted leading-relaxed">To ensure absolute protection against fraud on ShambaPoint:</p>
                  <ul className="text-xs text-ag-muted mt-2 space-y-1.5 list-disc list-inside">
                    <li>Always pay using the <strong className="text-ag-body">Smart SecurePay escrow</strong> system.</li>
                    <li>Never agree to pay transporters or sellers directly via personal numbers.</li>
                    <li>Ensure you verify produce weight and quality at delivery before approving release of escrow funds.</li>
                    <li>Contact admin support instantly if a user requests external payments.</li>
                  </ul>
                </div>
                <div className="border-t border-ag-border pt-3 text-[11px] text-ag-muted">
                  🛡️ Certified by Kenya Fintech Regulatory Authority Sandbox 2026.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── AI CHATBOT (Always Visible at the bottom) ── */}
      <div>
        <h3 className="font-extrabold text-ag-body mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-ag-primary" /> ShambaBot — AI Farming Advisor
        </h3>
        <ChatBot />
      </div>
    </div>
  );
}
