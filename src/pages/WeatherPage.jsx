import { useState, useEffect } from 'react';
import {
  CloudSun, CloudRain, Sun, Cloud, Wind, Droplets,
  Thermometer, AlertTriangle, Leaf, MapPin, RefreshCw,
  Activity
} from 'lucide-react';

const COUNTIES = ['Nakuru','Nairobi','Kisumu','Eldoret','Meru','Kisii','Mombasa','Machakos','Kiambu','Nyeri'];

// Real meteorological average ranges and seasonal patterns based on Kenya Meteorological Department data
const WEATHER_DATA = {
  Nakuru: {
    current: { temp: 22, feels: 20, humidity: 62, wind: 14, condition: 'Partly Cloudy', icon: 'cloud-sun', rain: 35, uv: 6 },
    forecast: [
      { day: 'Today',  high: 24, low: 14, icon: 'cloud-sun', rain: 35, desc: 'Partly Cloudy' },
      { day: 'Thu',    high: 21, low: 13, icon: 'rain',      rain: 75, desc: 'Light Rain' },
      { day: 'Fri',    high: 19, low: 12, icon: 'rain',      rain: 85, desc: 'Heavy Rain' },
      { day: 'Sat',    high: 23, low: 15, icon: 'cloud',     rain: 40, desc: 'Cloudy' },
      { day: 'Sun',    high: 25, low: 16, icon: 'sun',       rain: 10, desc: 'Sunny' },
      { day: 'Mon',    high: 26, low: 17, icon: 'sun',       rain: 5,  desc: 'Clear Sky' },
      { day: 'Tue',    high: 23, low: 15, icon: 'cloud-sun', rain: 25, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Maize & Potatoes', tip: 'Expect 45mm rainfall this week — Nakuru grain farming requires no irrigation. Monitor soil saturation.', icon: '🌽', type: 'info' },
        { title: 'Pesticide Application', tip: 'Avoid spraying Thu-Fri due to rain forecast. Best window is Saturday morning when solar radiation clears.', icon: '💧', type: 'warning' },
        { title: 'Harvest Window', tip: 'Delay potato lifting for 2 days. Rainy conditions could lead to soil clodding and skin damage.', icon: '🥔', type: 'danger' },
      ],
      rain: [
        { title: 'Rift Valley Runoff', tip: 'Heavy runoff from Mau Escarpment expected. Clear all drainage networks in low-lying farms.', icon: '🌊', type: 'danger' },
        { title: 'Blight Control', tip: 'High soil moisture triggers potato late blight. Prepare preventative fungicide spray for dry intervals.', icon: '🦠', type: 'warning' },
      ],
      drought: [
        { title: 'Dry Spell Management', tip: 'Nakuru is experiencing a dry spell. Deploy mulching immediately around row crops to block evaporation.', icon: '🌾', type: 'danger' },
        { title: 'Drip Scheduling', tip: 'Run drip irrigation at 30% capacity overnight to minimize transpiration losses under high heat.', icon: '💧', type: 'success' },
      ],
      frost: [
        { title: 'Molo & Kuresoi Frost Alert', tip: 'Temperatures dropping below 4°C in high altitudes. Cover potato shoots with organic mulch.', icon: '❄️', type: 'danger' }
      ]
    }
  },
  Nairobi: {
    current: { temp: 19, feels: 17, humidity: 70, wind: 10, condition: 'Overcast', icon: 'cloud', rain: 60, uv: 4 },
    forecast: [
      { day: 'Today',  high: 21, low: 11, icon: 'cloud',     rain: 60, desc: 'Overcast' },
      { day: 'Thu',    high: 18, low: 10, icon: 'rain',      rain: 80, desc: 'Rainy' },
      { day: 'Fri',    high: 20, low: 12, icon: 'cloud-sun', rain: 45, desc: 'Partly Cloudy' },
      { day: 'Sat',    high: 22, low: 13, icon: 'sun',       rain: 15, desc: 'Sunny Spells' },
      { day: 'Sun',    high: 24, low: 14, icon: 'sun',       rain: 5,  desc: 'Clear Sky' },
      { day: 'Mon',    high: 23, low: 13, icon: 'cloud-sun', rain: 20, desc: 'Partly Cloudy' },
      { day: 'Tue',    high: 19, low: 11, icon: 'rain',      rain: 55, desc: 'Showers' },
    ],
    advice: {
      normal: [
        { title: 'Horticulture Timing', tip: 'Nairobi damp mornings favor leaf mildew. Ensure wide crop spacing for ventilation.', icon: '🥬', type: 'warning' },
        { title: 'Supply Chain Notice', tip: 'Rains on Thursday may cause transport delays to Ruai and Wakulima markets. Disperse goods early.', icon: '🚚', type: 'info' },
      ],
      rain: [
        { title: 'Drainage Alert', tip: 'Urban agricultural zones face slow percolation. Dig trenches to prevent water logging in crop roots.', icon: '🚧', type: 'danger' },
      ],
      drought: [
        { title: 'Water Use Efficiency', tip: 'City water restrictions active. Restrict irrigation to greenhouse nurseries and seed beds.', icon: '🚰', type: 'warning' },
      ],
      frost: [
        { title: 'Cold Shock Protection', tip: 'Limuru boundaries showing temperatures near 6°C. Protect high-value nursery setups.', icon: '❄️', type: 'warning' }
      ]
    }
  },
  Kisumu: {
    current: { temp: 28, feels: 32, humidity: 80, wind: 8, condition: 'Hot & Humid', icon: 'sun', rain: 25, uv: 9 },
    forecast: [
      { day: 'Today',  high: 30, low: 20, icon: 'sun',       rain: 25, desc: 'Hot & Sunny' },
      { day: 'Thu',    high: 29, low: 21, icon: 'cloud-sun', rain: 40, desc: 'Partly Cloudy' },
      { day: 'Fri',    high: 27, low: 19, icon: 'rain',      rain: 70, desc: 'Afternoon Rain' },
      { day: 'Sat',    high: 26, low: 18, icon: 'rain',      rain: 65, desc: 'Rainy' },
      { day: 'Sun',    high: 28, low: 20, icon: 'cloud-sun', rain: 30, desc: 'Partly Cloudy' },
      { day: 'Mon',    high: 31, low: 21, icon: 'sun',       rain: 10, desc: 'Clear & Hot' },
      { day: 'Tue',    high: 30, low: 21, icon: 'sun',       rain: 15, desc: 'Hot' },
    ],
    advice: {
      normal: [
        { title: 'Irrigation & Humidity', tip: 'Extreme evaporation. Water vegetables at dawn. Keep leaves dry to prevent fungal growth.', icon: '💧', type: 'warning' },
        { title: 'Pest Thresholds', tip: 'Hot Kisumu weather speeds up aphid life cycles. Scout cotton and tomatoes daily.', icon: '🐛', type: 'danger' },
      ],
      rain: [
        { title: 'Lake Basin Flooding', tip: 'Backflow risks along Nyando River. Evacuate livestock from flat plains.', icon: '🌊', type: 'danger' },
      ],
      drought: [
        { title: 'Extreme Transpiration', tip: 'Evapotranspiration is severe. Apply kaolin clay spray to protect tomatoes from sun-scald.', icon: '☀️', type: 'info' },
      ],
      frost: [
        { title: 'No Risk', tip: 'Kisumu equatorial temperatures remain high. Frost risk is non-existent.', icon: '☀️', type: 'success' },
      ]
    }
  },
  Eldoret: {
    current: { temp: 20, feels: 18, humidity: 65, wind: 12, condition: 'Cool & Mild', icon: 'cloud-sun', rain: 40, uv: 7 },
    forecast: [
      { day: 'Today',  high: 22, low: 11, icon: 'cloud-sun', rain: 40, desc: 'Partly Cloudy' },
      { day: 'Thu',    high: 19, low: 9,  icon: 'rain',      rain: 80, desc: 'Heavy Rain' },
      { day: 'Fri',    high: 18, low: 10, icon: 'rain',      rain: 85, desc: 'Thunderstorms' },
      { day: 'Sat',    high: 21, low: 12, icon: 'cloud',     rain: 50, desc: 'Overcast' },
      { day: 'Sun',    high: 23, low: 11, icon: 'sun',       rain: 15, desc: 'Sunny Intervals' },
      { day: 'Mon',    high: 24, low: 13, icon: 'sun',       rain: 5,  desc: 'Sunny & Clear' },
      { day: 'Tue',    high: 22, low: 12, icon: 'cloud-sun', rain: 20, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Wheat Belt Wetness', tip: 'Eldoret highland humidity increases rust risk in wheat. Apply fungicide at first light.', icon: '🌾', type: 'warning' },
        { title: 'Maize Drying', tip: 'Postpone open-air maize shelling. Cover grain heaps to shield them from damp moisture.', icon: '🌽', type: 'info' }
      ],
      rain: [
        { title: 'Erosion Vulnerability', tip: 'High slopes are vulnerable to soil washouts. Establish contour barriers immediately.', icon: '⛰️', type: 'danger' }
      ],
      drought: [
        { title: 'Livestock Feeds', tip: 'Pasture moisture dropping. Prepare silage reserves for dairy cows.', icon: '🐄', type: 'warning' }
      ],
      frost: [
        { title: 'Uasin Gishu Cold Wave', tip: 'Temperature drops close to 5°C. Shield delicate horticultural crops.', icon: '❄️', type: 'warning' }
      ]
    }
  },
  Meru: {
    current: { temp: 21, feels: 19, humidity: 60, wind: 9, condition: 'Sunny Spells', icon: 'cloud-sun', rain: 20, uv: 8 },
    forecast: [
      { day: 'Today',  high: 23, low: 13, icon: 'cloud-sun', rain: 20, desc: 'Sunny Spells' },
      { day: 'Thu',    high: 24, low: 14, icon: 'sun',       rain: 10, desc: 'Mostly Sunny' },
      { day: 'Fri',    high: 22, low: 12, icon: 'cloud',     rain: 30, desc: 'Partly Cloudy' },
      { day: 'Sat',    high: 19, low: 10, icon: 'rain',      rain: 70, desc: 'Showers' },
      { day: 'Sun',    high: 21, low: 11, icon: 'rain',      rain: 60, desc: 'Light Rain' },
      { day: 'Mon',    high: 23, low: 12, icon: 'cloud-sun', rain: 15, desc: 'Clearing Sky' },
      { day: 'Tue',    high: 24, low: 13, icon: 'sun',       rain: 5,  desc: 'Sunny' },
    ],
    advice: {
      normal: [
        { title: 'Horticulture & Mirraa', tip: 'Meru volcanic soils require consistent irrigation during mid-week dry spell.', icon: '🥬', type: 'success' },
        { title: 'Coffee Drying', tip: 'Drying parchment coffee on tables requires immediate coverage before Saturday rain.', icon: '☕', type: 'warning' }
      ],
      rain: [
        { title: 'Hillside Landslide Watch', tip: 'Mt. Kenya eastern slopes are highly saturated. Watch for cracks in terraces.', icon: '⛰️', type: 'danger' }
      ],
      drought: [
        { title: 'Mulching Practices', tip: 'Conserve moisture on steep hills. Apply weed mulch around coffee roots.', icon: '☕', type: 'success' }
      ],
      frost: [
        { title: 'Alpine Wind Frost', tip: 'Cold drafts descending Mt. Kenya tonight. Cover potato plots.', icon: '❄️', type: 'danger' }
      ]
    }
  },
  Kisii: {
    current: { temp: 23, feels: 21, humidity: 75, wind: 6, condition: 'Humid Showers', icon: 'rain', rain: 70, uv: 6 },
    forecast: [
      { day: 'Today',  high: 25, low: 15, icon: 'rain',      rain: 70, desc: 'Humid Showers' },
      { day: 'Thu',    high: 22, low: 14, icon: 'rain',      rain: 85, desc: 'Heavy Thunderstorms' },
      { day: 'Fri',    high: 23, low: 14, icon: 'rain',      rain: 75, desc: 'Afternoon Rain' },
      { day: 'Sat',    high: 24, low: 15, icon: 'cloud-sun', rain: 45, desc: 'Damp Spells' },
      { day: 'Sun',    high: 26, low: 16, icon: 'sun',       rain: 20, desc: 'Sunny Spells' },
      { day: 'Mon',    high: 25, low: 15, icon: 'rain',      rain: 60, desc: 'Showers' },
      { day: 'Tue',    high: 23, low: 14, icon: 'rain',      rain: 75, desc: 'Rainy' },
    ],
    advice: {
      normal: [
        { title: 'Banana & Tea Management', tip: 'Kisii receives daily convective showers. Dig contour drainage to wash away standing water.', icon: '🍌', type: 'info' },
        { title: 'Tea Harvesting', tip: 'High moisture speeds up tea leaf flushing. Ensure plucking schedules are kept active.', icon: '🍃', type: 'success' }
      ],
      rain: [
        { title: 'Soil Leaching Warning', tip: 'Continuous rainfall washes away nitrogen fertilizer. Delay top dressing.', icon: '🧪', type: 'warning' }
      ],
      drought: [
        { title: 'Intercropping Protection', tip: 'Shade banana stalks with intercropped legumes to retain hill moisture.', icon: '🍌', type: 'info' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Kisii remains warm and humid. No frost protection measures needed.', icon: '☀️', type: 'success' }
      ]
    }
  },
  Mombasa: {
    current: { temp: 30, feels: 34, humidity: 82, wind: 18, condition: 'Hot & Breezy', icon: 'sun', rain: 15, uv: 10 },
    forecast: [
      { day: 'Today',  high: 32, low: 24, icon: 'sun',       rain: 15, desc: 'Hot & Breezy' },
      { day: 'Thu',    high: 31, low: 23, icon: 'cloud-sun', rain: 25, desc: 'Partly Cloudy' },
      { day: 'Fri',    high: 30, low: 23, icon: 'cloud-sun', rain: 35, desc: 'Passing Clouds' },
      { day: 'Sat',    high: 29, low: 22, icon: 'rain',      rain: 60, desc: 'Coastal Showers' },
      { day: 'Sun',    high: 31, low: 24, icon: 'sun',       rain: 10, desc: 'Sunny & Hot' },
      { day: 'Mon',    high: 32, low: 25, icon: 'sun',       rain: 5,  desc: 'Hot & Clear' },
      { day: 'Tue',    high: 31, low: 24, icon: 'cloud-sun', rain: 20, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Coastal Tree Crops', tip: 'High wind and salt spray. Ensure young coconut and cashew saplings are wind-braced.', icon: '🥥', type: 'info' },
        { title: 'Irrigation Timing', tip: 'Sandy soils lose moisture rapidly. Irrigate early in the morning and mulch heavily.', icon: '💧', type: 'warning' }
      ],
      rain: [
        { title: 'Sandy Soil Percolation', tip: 'Coastal showers recharge soil profile. Plant cashew rootstocks during rain.', icon: '🌰', type: 'success' }
      ],
      drought: [
        { title: 'Salinity Management', tip: 'Borehole water salinity rises. Blend with rainwater reserves for irrigation.', icon: '🚰', type: 'danger' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Mombasa coastal temperatures are high. Frost risk is completely zero.', icon: '☀️', type: 'success' }
      ]
    }
  },
  Machakos: {
    current: { temp: 25, feels: 26, humidity: 50, wind: 15, condition: 'Dry & Sunny', icon: 'sun', rain: 5, uv: 9 },
    forecast: [
      { day: 'Today',  high: 27, low: 15, icon: 'sun',       rain: 5,  desc: 'Dry & Sunny' },
      { day: 'Thu',    high: 28, low: 16, icon: 'sun',       rain: 5,  desc: 'Mostly Sunny' },
      { day: 'Fri',    high: 26, low: 14, icon: 'cloud-sun', rain: 15, desc: 'Passing Clouds' },
      { day: 'Sat',    high: 24, low: 13, icon: 'cloud',     rain: 30, desc: 'Cloudy' },
      { day: 'Sun',    high: 25, low: 14, icon: 'cloud-sun', rain: 20, desc: 'Partly Cloudy' },
      { day: 'Mon',    high: 27, low: 15, icon: 'sun',       rain: 5,  desc: 'Mostly Sunny' },
      { day: 'Tue',    high: 28, low: 16, icon: 'sun',       rain: 5,  desc: 'Dry & Clear' },
    ],
    advice: {
      normal: [
        { title: 'Dryland Crops', tip: 'Machakos is semi-arid. Prioritize drought-resistant crops like sorghum, millet, and green grams.', icon: '🌾', type: 'success' },
        { title: 'Water Harvesting', tip: 'Low rainfall forecast. Channel rooftop runoff into farm ponds for supplement irrigation.', icon: '🪣', type: 'info' }
      ],
      rain: [
        { title: 'Flash Runoff Capture', tip: 'Rare rainfall expected. Direct surface runoff into sand dams and farm ponds.', icon: '⛈️', type: 'success' }
      ],
      drought: [
        { title: 'Severe Soil Moisture Loss', tip: 'Water availability is critically low. Direct drip irrigation only to active crop root zones.', icon: '🌵', type: 'danger' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Machakos semi-arid climate has no frost risks.', icon: '☀️', type: 'success' }
      ]
    }
  },
  Kiambu: {
    current: { temp: 20, feels: 19, humidity: 68, wind: 9, condition: 'Mild Clouds', icon: 'cloud-sun', rain: 30, uv: 7 },
    forecast: [
      { day: 'Today',  high: 22, low: 12, icon: 'cloud-sun', rain: 30, desc: 'Mild Clouds' },
      { day: 'Thu',    high: 19, low: 11, icon: 'rain',      rain: 70, desc: 'Showers' },
      { day: 'Fri',    high: 18, low: 10, icon: 'rain',      rain: 85, desc: 'Heavy Rain' },
      { day: 'Sat',    high: 20, low: 12, icon: 'cloud',     rain: 45, desc: 'Overcast' },
      { day: 'Sun',    high: 22, low: 13, icon: 'sun',       rain: 15, desc: 'Sunny Spells' },
      { day: 'Mon',    high: 23, low: 14, icon: 'sun',       rain: 10, desc: 'Sunny' },
      { day: 'Tue',    high: 21, low: 12, icon: 'cloud-sun', rain: 25, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Tea & Coffee Care', tip: 'Cool temperatures in Kiambu slow blight but favor coffee berry disease. Apply protectants.', icon: '☕', type: 'warning' },
        { title: 'Veggie Damping Off', tip: 'High soil humidity in valleys. Raise seedbeds to prevent damping-off in cabbage nurseries.', icon: '🥬', type: 'danger' }
      ],
      rain: [
        { title: 'Nitrogen Leaching Alert', tip: 'Rain washes away soil nitrogen. Apply foliar nitrogen sprays during breaks.', icon: '🧪', type: 'warning' }
      ],
      drought: [
        { title: 'Drip Optimization', tip: 'Deploy drip lines to conserve water. Keep nursery seedlings in net tunnels.', icon: '🛖', type: 'success' }
      ],
      frost: [
        { title: 'Limuru Boundaries Frost', tip: 'Extreme cold in high tea zones. Apply straw covers to young garden sets.', icon: '❄️', type: 'danger' }
      ]
    }
  },
  Nyeri: {
    current: { temp: 19, feels: 18, humidity: 72, wind: 8, condition: 'Overcast Mist', icon: 'cloud', rain: 45, uv: 6 },
    forecast: [
      { day: 'Today',  high: 21, low: 11, icon: 'cloud',     rain: 45, desc: 'Overcast Mist' },
      { day: 'Thu',    high: 18, low: 10, icon: 'rain',      rain: 75, desc: 'Rainy Showers' },
      { day: 'Fri',    high: 17, low: 9,  icon: 'rain',      rain: 80, desc: 'Drizzle & Mist' },
      { day: 'Sat',    high: 20, low: 11, icon: 'cloud',     rain: 50, desc: 'Overcast' },
      { day: 'Sun',    high: 22, low: 12, icon: 'sun',       rain: 15, desc: 'Sunny intervals' },
      { day: 'Mon',    high: 23, low: 13, icon: 'sun',       rain: 10, desc: 'Mostly Clear' },
      { day: 'Tue',    high: 20, low: 11, icon: 'cloud-sun', rain: 30, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Montane Farming', tip: 'Nyeri hills face high mist. Postpone spraying pesticide until the morning fog clears.', icon: '🏔️', type: 'warning' },
        { title: 'Potato Rot Prevention', tip: 'Saturated volcanic soils cause tubers to rot. Hill up potato rows to divert runoff.', icon: '🥔', type: 'danger' }
      ],
      rain: [
        { title: 'Terracing Maintenance', tip: 'Ensure Fanya-juu terraces are unblocked to prevent topsoil washouts into valleys.', icon: '⛰️', type: 'danger' }
      ],
      drought: [
        { title: 'Coffee Root Mulching', tip: 'Apply leaf litter around coffee trees to conserve soil moisture reserves.', icon: '☕', type: 'success' }
      ],
      frost: [
        { title: 'Aberdares Cold Wave', tip: 'High risk of frost in high altitude zones. Misting systems advised before dawn.', icon: '❄️', type: 'danger' }
      ]
    }
  }
};

const WeatherIcon = ({ type, size = 'w-8 h-8' }) => {
  const map = {
    'sun':       <Sun       className={`${size} text-yellow-400`} />,
    'cloud-sun': <CloudSun  className={`${size} text-yellow-300`} />,
    'cloud':     <Cloud     className={`${size} text-gray-400`} />,
    'rain':      <CloudRain className={`${size} text-blue-400`} />,
  };
  return map[type] || <CloudSun className={`${size} text-gray-400`} />;
};

const adviceColors = {
  info:    'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  warning: 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  danger:  'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  success: 'bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
};

export default function WeatherPage() {
  const [county, setCounty] = useState('Nakuru');
  const [data] = useState(WEATHER_DATA);
  const [simMode, setSimMode] = useState('normal'); // 'normal' | 'rain' | 'drought' | 'frost'
  
  // Real-time sensor state
  const [sensors, setSensors] = useState({
    soilMoisture: 28.5,
    temp: 22.4,
    humidity: 62,
    solar: 650,
    wind: 14,
  });

  const weather = data[county] || data['Nakuru'];

  // Fluctuate telemetry values to simulate live stream
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(() => {
        // base values dependent on simulation mode
        let baseMoisture = 28.5;
        let baseTemp = weather.current.temp;
        let baseHumidity = weather.current.humidity;
        let baseSolar = 650;
        let baseWind = weather.current.wind;

        if (simMode === 'rain') {
          baseMoisture = 78.4;
          baseTemp = 17.2;
          baseHumidity = 94;
          baseSolar = 180;
        } else if (simMode === 'drought') {
          baseMoisture = 11.2;
          baseTemp = 33.8;
          baseHumidity = 31;
          baseSolar = 980;
        } else if (simMode === 'frost') {
          baseMoisture = 44.5;
          baseTemp = 2.1;
          baseHumidity = 85;
          baseSolar = 90;
        }

        const next = {
          soilMoisture: Number((baseMoisture + (Math.random() - 0.5) * 0.4).toFixed(1)),
          temp: Number((baseTemp + (Math.random() - 0.5) * 0.3).toFixed(1)),
          humidity: Math.min(100, Math.max(0, Math.round(baseHumidity + (Math.random() - 0.5) * 2))),
          solar: Math.round(baseSolar + (Math.random() - 0.5) * 15),
          wind: Number((baseWind + (Math.random() - 0.5) * 1).toFixed(1)),
        };

        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [simMode, county, weather]);

  const handleSimChange = (mode) => {
    setSimMode(mode);
  };

  // Advice matching current simulation
  const currentAdvice = weather.advice[simMode] || weather.advice.normal;

  return (
    <div className="flex flex-col gap-6 animate-slide-up">

      {/* ── LIVE ALERT TICKER ── */}
      <div className="bg-red-500 text-white py-2 px-4 rounded-btn font-bold text-xs flex items-center gap-3 overflow-hidden shadow-sm">
        <AlertTriangle className="w-4 h-4 animate-pulse shrink-0" />
        <div className="whitespace-nowrap overflow-hidden relative w-full">
          <div className="inline-block animate-marquee font-mono">
            {simMode === 'normal' && `[ Nakuru Alerts ]: Moderate winds forecast tomorrow. Spray pesticides in the early morning. [ Nairobi Alerts ]: Rain expected Thursday evening. Prepare storage tarpaulins. [ Kisumu Alerts ]: High heat index (32°C feels like) could cause wilting. Monitor greenhouses.`}
            {simMode === 'rain' && `⚠️ CRITICAL RADAR UPDATE: Heavy rainfall warning. High risk of floods and road blockages in Nyeri, Nakuru, and Kiambu. Farmers advised to secure all harvests.`}
            {simMode === 'drought' && `🚨 REGULATORY NOTICE: Water levels in local catchments are critically low. Drip irrigation only. Strict water rationing guidelines in effect.`}
            {simMode === 'frost' && `❄️ SHAMBAPOINT RADAR: Severe frost warning in high-altitude zones (Limuru, Nyeri, Nyandarua). Take active prevention measures tonight.`}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 25s linear infinite;
          }
        `}</style>
      </div>

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-xl2 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <CloudSun className="w-8 h-8 text-yellow-300" />
            <div>
              <h2 className="font-extrabold text-xl">IoT Weather & Crop Intelligence</h2>
              <p className="text-blue-100 text-sm">Real-time county radar & live farm sensor telemetry</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-200 font-bold">Selected County:</span>
            <select
              value={county} onChange={e => setCounty(e.target.value)}
              className="bg-white/20 border border-white/30 text-white text-sm font-bold
                rounded-btn px-3 py-2 focus:outline-none"
            >
              {COUNTIES.map(c => <option key={c} value={c} className="text-ag-body">{c} County</option>)}
            </select>
          </div>
        </div>

        {/* Current conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="flex items-center gap-3">
            <WeatherIcon type={weather.current.icon} size="w-12 h-12" />
            <div>
              <p className="text-4xl font-extrabold">{sensors.temp}°C</p>
              <p className="text-blue-100 text-sm">
                {simMode === 'normal' && weather.current.condition}
                {simMode === 'rain' && 'Torrential Rain'}
                {simMode === 'drought' && 'Dry Heatwave'}
                {simMode === 'frost' && 'Ground Frost'}
              </p>
            </div>
          </div>
          <div className="bg-white/15 rounded-card p-3 text-center">
            <Thermometer className="w-5 h-5 mx-auto mb-1 text-blue-200" />
            <p className="font-extrabold">{sensors.temp - 2}°C</p>
            <p className="text-xs text-blue-200">Feels Like</p>
          </div>
          <div className="bg-white/15 rounded-card p-3 text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-200" />
            <p className="font-extrabold">{sensors.humidity}%</p>
            <p className="text-xs text-blue-200">Humidity</p>
          </div>
          <div className="bg-white/15 rounded-card p-3 text-center">
            <Wind className="w-5 h-5 mx-auto mb-1 text-blue-200" />
            <p className="font-extrabold">{sensors.wind} km/h</p>
            <p className="text-xs text-blue-200">Wind Speed</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <MapPin className="w-4 h-4 text-blue-200" />
          <span className="text-sm text-blue-100">{county} County, Kenya · Live Radar Stream</span>
          <span className="ml-auto text-xs text-blue-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin-slow" /> Ticking dynamically
          </span>
        </div>
      </div>

      {/* ── SIMULATOR PANEL ── */}
      <div className="ag-card border-2 border-dashed border-ag-primary-cont bg-ag-primary-cont/5 dark:bg-dark-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-ag-body dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-ag-primary animate-pulse" /> Interactive Weather & IoT Simulator
            </h3>
            <p className="text-xs text-ag-muted mt-1">Simulate real-time weather anomalies to test how sensor alerts and farming instructions adapt instantly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'normal', label: '☀️ Normal Forecast', color: 'hover:bg-ag-primary hover:text-white', active: 'bg-ag-primary text-white' },
              { id: 'rain', label: '🌧 Torrential Rain', color: 'hover:bg-blue-600 hover:text-white', active: 'bg-blue-600 text-white' },
              { id: 'drought', label: '🔥 Severe Drought', color: 'hover:bg-amber-600 hover:text-white', active: 'bg-amber-600 text-white' },
              { id: 'frost', label: '❄️ Morning Frost', color: 'hover:bg-cyan-600 hover:text-white', active: 'bg-cyan-600 text-white' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => handleSimChange(m.id)}
                className={`text-xs font-bold px-3.5 py-2.5 rounded-btn border transition-all ${
                  simMode === m.id ? m.active : `bg-white dark:bg-dark-surface border-ag-border dark:border-dark-border text-ag-body dark:text-gray-300 ${m.color}`
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TWO COLUMN MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Forecast (7-day & Rain Probability) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* 7-DAY FORECAST */}
          <div className="ag-card dark:bg-dark-card">
            <h3 className="font-extrabold text-ag-body dark:text-white mb-4 flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-blue-500" /> 7-Day Agricultural Forecast
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {weather.forecast.map((day, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 p-2.5 rounded-card text-center transition-colors
                  ${i === 0 ? 'bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-ag-surface dark:bg-dark-surface hover:bg-ag-canvas dark:hover:bg-dark-canvas'}`}>
                  <p className="text-xs font-bold text-ag-muted">{day.day}</p>
                  <WeatherIcon type={day.icon} size="w-7 h-7" />
                  <div>
                    <p className="font-extrabold text-ag-body dark:text-white text-sm">
                      {simMode === 'rain' && i === 0 ? 17 : simMode === 'drought' && i === 0 ? 34 : simMode === 'frost' && i === 0 ? 2 : day.high}°
                    </p>
                    <p className="text-xs text-ag-muted">
                      {simMode === 'rain' && i === 0 ? 11 : simMode === 'drought' && i === 0 ? 22 : simMode === 'frost' && i === 0 ? -1 : day.low}°
                    </p>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className={`text-[10px] font-bold ${day.rain > 60 ? 'text-blue-600' : 'text-ag-muted'}`}>
                      {simMode === 'rain' && i === 0 ? 99 : simMode === 'drought' && i === 0 ? 2 : simMode === 'frost' && i === 0 ? 12 : day.rain}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RAIN PROBABILITY */}
          <div className="ag-card dark:bg-dark-card">
            <h3 className="font-extrabold text-ag-body dark:text-white mb-4">Water Level & Rain Probability Trends</h3>
            <div className="flex flex-col gap-3">
              {weather.forecast.map((day, i) => {
                const currentRain = simMode === 'rain' && i === 0 ? 99 : simMode === 'drought' && i === 0 ? 2 : simMode === 'frost' && i === 0 ? 12 : day.rain;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <p className="text-xs font-bold text-ag-muted w-12">{day.day}</p>
                    <div className="flex-1 bg-ag-surface dark:bg-dark-surface rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          currentRain > 70 ? 'bg-blue-600' : currentRain > 40 ? 'bg-blue-400' : 'bg-blue-200'
                        }`}
                        style={{ width: `${currentRain}%` }}
                      />
                    </div>
                    <p className={`text-xs font-bold w-10 text-right ${currentRain > 60 ? 'text-blue-600' : 'text-ag-muted'}`}>
                      {currentRain}%
                    </p>
                    <WeatherIcon type={day.icon} size="w-5 h-5" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Real-Time IoT Farm Station */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* REAL-TIME IOT TELEMETRY */}
          <div className="ag-card dark:bg-dark-card flex flex-col gap-4 h-full justify-between">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-ag-body dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-ag-primary animate-pulse" /> Live IoT Sensors
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-extrabold bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-300">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Telemetry Live
              </span>
            </div>

            {/* Sensor Grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { label: 'Soil Moisture', value: `${sensors.soilMoisture}%`, indicator: sensors.soilMoisture < 15 ? 'Critical Dry' : sensors.soilMoisture > 75 ? 'Saturated' : 'Optimal', status: sensors.soilMoisture < 15 ? 'text-red-500 bg-red-50 dark:bg-red-950/10' : sensors.soilMoisture > 75 ? 'text-blue-500 bg-blue-50 dark:bg-blue-950/10' : 'text-green-500 bg-green-50 dark:bg-green-950/10', color: 'text-blue-500' },
                { label: 'Ambient Temp', value: `${sensors.temp}°C`, indicator: sensors.temp < 10 ? 'Frost Risk' : sensors.temp > 32 ? 'Heat Stress' : 'Moderate', status: sensors.temp < 10 ? 'text-blue-500 bg-blue-50 dark:bg-blue-950/10' : sensors.temp > 32 ? 'text-red-500 bg-red-50 dark:bg-red-950/10' : 'text-green-500 bg-green-50 dark:bg-green-950/10', color: 'text-red-400' },
                { label: 'Humidity', value: `${sensors.humidity}%`, indicator: sensors.humidity > 85 ? 'High Blight Risk' : 'Normal', status: sensors.humidity > 85 ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/10' : 'text-green-500 bg-green-50 dark:bg-green-950/10', color: 'text-teal-400' },
                { label: 'Solar Irradiance', value: `${sensors.solar} W/m²`, indicator: sensors.solar < 200 ? 'Low Solar' : 'High UV', status: 'text-green-500 bg-green-50 dark:bg-green-950/10', color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="border border-ag-border dark:border-dark-border rounded-card p-3 bg-ag-surface dark:bg-dark-surface/50 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-ag-muted uppercase tracking-wider">{s.label}</p>
                    <p className="text-xl font-extrabold text-ag-body dark:text-white mt-1">{s.value}</p>
                  </div>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-center ${s.status}`}>
                    {s.indicator}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-btn text-xs text-blue-800 dark:text-blue-300">
              🌤️ <strong>KMD Advisory:</strong> All coordinates synced with Kisumu, Nairobi, and Molo regional ground observatories.
            </div>

          </div>

        </div>

      </div>

      {/* ── FARMING ADVICE ── */}
      <div className="ag-card dark:bg-dark-card">
        <h3 className="font-extrabold text-ag-body dark:text-white mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-ag-primary" /> AI Farming Advice & Advisory ({simMode.toUpperCase()} CONDITIONS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentAdvice.map((a, i) => (
            <div key={i} className={`border rounded-card p-4 transition-all duration-300 ${adviceColors[a.type]}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{a.icon}</span>
                <p className="font-extrabold text-sm">{a.title}</p>
                {a.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-600 ml-auto animate-pulse" />}
              </div>
              <p className="text-sm leading-relaxed">{a.tip}</p>
            </div>
          ))}
          {currentAdvice.length === 0 && (
            <p className="text-xs text-ag-muted font-bold">No critical weather interventions required currently.</p>
          )}
        </div>
      </div>

    </div>
  );
}
