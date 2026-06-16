import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react';

// ---- Sample product data ----
const featuredCrops = [
  { id: 1, name: 'Irish Potatoes',   county: 'Nakuru',      price: 45,  unit: 'kg', farmer: 'Mwangi J.', badge: 'VERIFIED',  img: '/images/potatoes.png'  },
  { id: 2, name: 'Grade A Tomatoes', county: 'Kiambu',      price: 80,  unit: 'kg', farmer: 'Sarah K.',  badge: 'LOW STOCK', img: '/images/tomatoes.png'  },
  { id: 3, name: 'Sweet Green Maize',county: 'Uasin Gishu', price: 25,  unit: 'pc', farmer: 'Kibet E.',  badge: 'VERIFIED',  img: '/images/maize.png'     },
  { id: 4, name: 'Red Onions',       county: 'Kajiado',     price: 120, unit: 'kg', farmer: 'Agnes L.',  badge: 'VERIFIED',  img: '/images/onions.png'    },
];


const Landing = () => {
  return (
    <div className="bg-ag-canvas">
      {/* ===== HERO ===== */}
      <section className="bg-ag-primary">
        <div className="max-w-desktop mx-auto px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <span className="inline-block bg-ag-primary-fixed text-ag-primary text-label-bold font-bold uppercase text-xs px-3 py-1 rounded-full mb-6 tracking-widest">
              Kenya's #1 Farm-to-Buyer Platform
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
              Sell Your Harvest.<br />Get Paid Instantly.
            </h1>
            <p className="text-white/75 text-body-lg mb-10 max-w-2xl">
              Your land is your business. Your harvest is your income. ShambaPoint was not built for the big companies it was built for you, the farmer who wakes up before the sun, who works the soil with their hands, who feeds this nation and still struggles to get a fair price.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-base px-8">
                Start Selling <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/market" className="btn-secondary text-base px-8 !border-white !text-white hover:!bg-white/10">
                Browse Products
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="rounded-card overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
                alt="Kenyan farmers harvesting crops"
                className="w-full h-80 lg:h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STATS ===== */}
      <section className="border-b border-ag-border">
        <div className="max-w-desktop mx-auto px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Users, value: '10,000+', label: 'Verified Farmers' },
            { icon: DollarSign, value: 'KSh 50M+', label: 'Total Traded' },
            { icon: TrendingUp, value: 'Real-Time', label: 'Market Prices' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="ag-card flex items-center gap-5">
              <div className="w-12 h-12 bg-ag-primary rounded-card flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-ag-primary-fixed" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-ag-body">{value}</p>
                <p className="text-ag-muted text-sm font-bold">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED CROPS ===== */}
      <section className="max-w-desktop mx-auto px-12 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-headline-lg text-ag-body">Featured Crops This Week</h2>
          <Link to="/market" className="btn-tertiary">View All →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map(crop => (
            <div key={crop.id} className="ag-card p-0 overflow-hidden flex flex-col hover:border-ag-primary transition-colors">
              {/* Image */}
              <div className="h-44 relative overflow-hidden">
                <img src={crop.img} alt={crop.name} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${
                  crop.badge === 'VERIFIED' ? 'chip-verified' : 'chip-low-stock'
                }`}>{crop.badge}</span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-ag-muted text-xs mb-1">
                  <span>📍 {crop.county}</span>
                </div>
                <h3 className="font-bold text-ag-body text-base mb-1">{crop.name}</h3>
                <p className="text-xs text-ag-muted mb-3">Farmer: {crop.farmer}</p>
                <p className="text-ag-amber font-extrabold text-xl mb-4">KSh {crop.price}<span className="text-sm font-normal text-ag-muted">/{crop.unit}</span></p>
                <button className="btn-primary w-full !min-h-0 !py-3 !text-sm mt-auto">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* ===== FOOTER ===== */}
      <footer className="bg-ag-primary">
        <div className="max-w-desktop mx-auto px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-white font-extrabold text-lg">
            <Leaf className="w-5 h-5 text-ag-primary-fixed" />
            ShambaPoint
          </div>
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} ShambaPoint Kenya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
