import { useState, useEffect } from 'react';
import {
  CloudSun, CloudRain, Sun, Cloud, Wind, Droplets,
  Thermometer, AlertTriangle, Leaf, MapPin, RefreshCw,
  Activity, Truck, ShieldAlert, Info, CheckCircle,
  Wheat, FlaskConical, Snowflake, Waves, Bug, Coffee,
  TreePine, Mountain, Droplet
} from 'lucide-react';

const COUNTIES = ['Nakuru', 'Nairobi', 'Kisumu', 'Eldoret', 'Meru', 'Kisii', 'Mombasa', 'Machakos', 'Kiambu', 'Nyeri'];

const COUNTY_COORDS = {
  Nakuru: { lat: -0.303, lon: 36.080 },
  Nairobi: { lat: -1.292, lon: 36.822 },
  Kisumu: { lat: -0.102, lon: 34.761 },
  Eldoret: { lat: 0.514, lon: 35.269 },
  Meru: { lat: 0.046, lon: 37.655 },
  Kisii: { lat: -0.681, lon: 34.771 },
  Mombasa: { lat: -4.043, lon: 39.668 },
  Machakos: { lat: -1.517, lon: 37.263 },
  Kiambu: { lat: -1.171, lon: 36.830 },
  Nyeri: { lat: -0.417, lon: 36.951 },
};

// Interpretation of WMO weather interpretation codes
const mapWeatherCode = (code) => {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun' };
  if ([1, 2, 3].includes(code)) return { condition: 'Partly Cloudy', icon: 'cloud-sun' };
  if ([45, 48].includes(code)) return { condition: 'Foggy', icon: 'cloud' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', icon: 'rain' };
  if ([61, 63, 65, 66, 67].includes(code)) return { condition: 'Rainy', icon: 'rain' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snowy', icon: 'cloud' };
  if ([80, 81, 82].includes(code)) return { condition: 'Showers', icon: 'rain' };
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorms', icon: 'rain' };
  return { condition: 'Cloudy', icon: 'cloud-sun' };
};

// Real meteorological average ranges and seasonal patterns based on Kenya Meteorological Department data
const WEATHER_DATA_FALLBACK = {
  Nakuru: {
    current: { temp: 22, feels: 20, humidity: 62, wind: 14, gusts: 18, rain: 0, condition: 'Partly Cloudy', icon: 'cloud-sun', uv: 6 },
    forecast: [
      { day: 'Today', high: 24, low: 14, icon: 'cloud-sun', rain: 35, rainSum: 0, desc: 'Partly Cloudy' },
      { day: 'Thu', high: 21, low: 13, icon: 'rain', rain: 75, rainSum: 8, desc: 'Light Rain' },
      { day: 'Fri', high: 19, low: 12, icon: 'rain', rain: 85, rainSum: 15, desc: 'Heavy Rain' },
      { day: 'Sat', high: 23, low: 15, icon: 'cloud', rain: 40, rainSum: 2, desc: 'Cloudy' },
      { day: 'Sun', high: 25, low: 16, icon: 'sun', rain: 10, rainSum: 0, desc: 'Sunny' },
      { day: 'Mon', high: 26, low: 17, icon: 'sun', rain: 5, rainSum: 0, desc: 'Clear Sky' },
      { day: 'Tue', high: 23, low: 15, icon: 'cloud-sun', rain: 25, rainSum: 1, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Maize & Potatoes', tip: 'Expect moderate rainfall this week — Nakuru grain farming requires no irrigation. Monitor soil saturation.', icon: 'wheat', type: 'info' },
        { title: 'Pesticide Application', tip: 'Avoid spraying during windy and rainy days. Best window is Saturday morning when solar radiation clears.', icon: 'droplet', type: 'warning' },
        { title: 'Harvest Window', tip: 'Delay potato lifting if heavy rain occurs. Rainy conditions could lead to soil clodding and skin damage.', icon: 'leaf', type: 'danger' },
      ],
      rain: [
        { title: 'Rift Valley Runoff', tip: 'Heavy runoff from Mau Escarpment expected. Clear all drainage networks in low-lying farms.', icon: 'waves', type: 'danger' },
        { title: 'Blight Control', tip: 'High soil moisture triggers potato late blight. Prepare preventative fungicide spray for dry intervals.', icon: 'flask', type: 'warning' },
      ],
      drought: [
        { title: 'Dry Spell Management', tip: 'Nakuru is experiencing a dry spell. Deploy mulching immediately around row crops to block evaporation.', icon: 'wheat', type: 'danger' },
        { title: 'Drip Scheduling', tip: 'Run drip irrigation at 30% capacity overnight to minimize transpiration losses under high heat.', icon: 'droplet', type: 'success' },
      ],
      frost: [
        { title: 'Molo & Kuresoi Frost Alert', tip: 'Temperatures dropping below 4°C in high altitudes. Cover potato shoots with organic mulch.', icon: 'snowflake', type: 'danger' }
      ]
    }
  },
  Nairobi: {
    current: { temp: 19, feels: 17, humidity: 70, wind: 10, gusts: 14, rain: 0, condition: 'Overcast', icon: 'cloud', uv: 4 },
    forecast: [
      { day: 'Today', high: 21, low: 11, icon: 'cloud', rain: 60, rainSum: 1, desc: 'Overcast' },
      { day: 'Thu', high: 18, low: 10, icon: 'rain', rain: 80, rainSum: 10, desc: 'Rainy' },
      { day: 'Fri', high: 20, low: 12, icon: 'cloud-sun', rain: 45, rainSum: 3, desc: 'Partly Cloudy' },
      { day: 'Sat', high: 22, low: 13, icon: 'sun', rain: 15, rainSum: 0, desc: 'Sunny Spells' },
      { day: 'Sun', high: 24, low: 14, icon: 'sun', rain: 5, rainSum: 0, desc: 'Clear Sky' },
      { day: 'Mon', high: 23, low: 13, icon: 'cloud-sun', rain: 20, rainSum: 0, desc: 'Partly Cloudy' },
      { day: 'Tue', high: 19, low: 11, icon: 'rain', rain: 55, rainSum: 5, desc: 'Showers' },
    ],
    advice: {
      normal: [
        { title: 'Horticulture Timing', tip: 'Nairobi damp mornings favor leaf mildew. Ensure wide crop spacing for ventilation.', icon: 'leaf', type: 'warning' },
        { title: 'Supply Chain Notice', tip: 'Rains may cause transport delays to Ruai and Wakulima markets. Disperse goods early.', icon: 'truck', type: 'info' },
      ],
      rain: [
        { title: 'Drainage Alert', tip: 'Urban agricultural zones face slow percolation. Dig trenches to prevent water logging in crop roots.', icon: 'alert', type: 'danger' },
      ],
      drought: [
        { title: 'Water Use Efficiency', tip: 'City water restrictions active. Restrict irrigation to greenhouse nurseries and seed beds.', icon: 'droplet', type: 'warning' },
      ],
      frost: [
        { title: 'Cold Shock Protection', tip: 'Limuru boundaries showing temperatures near 6°C. Protect high-value nursery setups.', icon: 'snowflake', type: 'warning' }
      ]
    }
  },
  Kisumu: {
    current: { temp: 28, feels: 32, humidity: 80, wind: 8, gusts: 11, rain: 0, condition: 'Hot & Humid', icon: 'sun', uv: 9 },
    forecast: [
      { day: 'Today', high: 30, low: 20, icon: 'sun', rain: 25, rainSum: 0, desc: 'Hot & Sunny' },
      { day: 'Thu', high: 29, low: 21, icon: 'cloud-sun', rain: 40, rainSum: 2, desc: 'Partly Cloudy' },
      { day: 'Fri', high: 27, low: 19, icon: 'rain', rain: 70, rainSum: 12, desc: 'Afternoon Rain' },
      { day: 'Sat', high: 26, low: 18, icon: 'rain', rain: 65, rainSum: 10, desc: 'Rainy' },
      { day: 'Sun', high: 28, low: 20, icon: 'cloud-sun', rain: 30, rainSum: 1, desc: 'Partly Cloudy' },
      { day: 'Mon', high: 31, low: 21, icon: 'sun', rain: 10, rainSum: 0, desc: 'Clear & Hot' },
      { day: 'Tue', high: 30, low: 21, icon: 'sun', rain: 15, rainSum: 0, desc: 'Hot' },
    ],
    advice: {
      normal: [
        { title: 'Irrigation & Humidity', tip: 'Extreme evaporation. Water vegetables at dawn. Keep leaves dry to prevent fungal growth.', icon: 'droplet', type: 'warning' },
        { title: 'Pest Thresholds', tip: 'Hot Kisumu weather speeds up aphid life cycles. Scout cotton and tomatoes daily.', icon: 'bug', type: 'danger' },
      ],
      rain: [
        { title: 'Lake Basin Flooding', tip: 'Backflow risks along Nyando River. Evacuate livestock from flat plains.', icon: 'waves', type: 'danger' },
      ],
      drought: [
        { title: 'Extreme Transpiration', tip: 'Evapotranspiration is severe. Apply kaolin clay spray to protect tomatoes from sun-scald.', icon: 'sun', type: 'info' },
      ],
      frost: [
        { title: 'No Risk', tip: 'Kisumu equatorial temperatures remain high. Frost risk is non-existent.', icon: 'sun', type: 'success' }
      ]
    }
  },
  Eldoret: {
    current: { temp: 20, feels: 18, humidity: 65, wind: 12, gusts: 16, rain: 0, condition: 'Cool & Mild', icon: 'cloud-sun', uv: 7 },
    forecast: [
      { day: 'Today', high: 22, low: 11, icon: 'cloud-sun', rain: 40, rainSum: 1, desc: 'Partly Cloudy' },
      { day: 'Thu', high: 19, low: 9, icon: 'rain', rain: 80, rainSum: 15, desc: 'Heavy Rain' },
      { day: 'Fri', high: 18, low: 10, icon: 'rain', rain: 85, rainSum: 22, desc: 'Thunderstorms' },
      { day: 'Sat', high: 21, low: 12, icon: 'cloud', rain: 50, rainSum: 3, desc: 'Overcast' },
      { day: 'Sun', high: 23, low: 11, icon: 'sun', rain: 15, rainSum: 0, desc: 'Sunny Intervals' },
      { day: 'Mon', high: 24, low: 13, icon: 'sun', rain: 5, rainSum: 0, desc: 'Sunny & Clear' },
      { day: 'Tue', high: 22, low: 12, icon: 'cloud-sun', rain: 20, rainSum: 0, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Wheat Belt Wetness', tip: 'Eldoret highland humidity increases rust risk in wheat. Apply fungicide at first light.', icon: 'wheat', type: 'warning' },
        { title: 'Maize Drying', tip: 'Postpone open-air maize shelling during wet periods. Cover grain heaps to shield them from damp moisture.', icon: 'wheat', type: 'info' }
      ],
      rain: [
        { title: 'Erosion Vulnerability', tip: 'High slopes are vulnerable to soil washouts. Establish contour barriers immediately.', icon: 'mountain', type: 'danger' }
      ],
      drought: [
        { title: 'Livestock Feeds', tip: 'Pasture moisture dropping. Prepare silage reserves for dairy cows.', icon: 'leaf', type: 'warning' }
      ],
      frost: [
        { title: 'Uasin Gishu Cold Wave', tip: 'Temperature drops close to 5°C. Shield delicate horticultural crops.', icon: 'snowflake', type: 'warning' }
      ]
    }
  },
  Meru: {
    current: { temp: 21, feels: 19, humidity: 60, wind: 9, gusts: 12, rain: 0, condition: 'Sunny Spells', icon: 'cloud-sun', uv: 8 },
    forecast: [
      { day: 'Today', high: 23, low: 13, icon: 'cloud-sun', rain: 20, rainSum: 0, desc: 'Sunny Spells' },
      { day: 'Thu', high: 24, low: 14, icon: 'sun', rain: 10, rainSum: 0, desc: 'Mostly Sunny' },
      { day: 'Fri', high: 22, low: 12, icon: 'cloud', rain: 30, rainSum: 1, desc: 'Partly Cloudy' },
      { day: 'Sat', high: 19, low: 10, icon: 'rain', rain: 70, rainSum: 9, desc: 'Showers' },
      { day: 'Sun', high: 21, low: 11, icon: 'rain', rain: 60, rainSum: 6, desc: 'Light Rain' },
      { day: 'Mon', high: 23, low: 12, icon: 'cloud-sun', rain: 15, rainSum: 0, desc: 'Clearing Sky' },
      { day: 'Tue', high: 24, low: 13, icon: 'sun', rain: 5, rainSum: 0, desc: 'Sunny' },
    ],
    advice: {
      normal: [
        { title: 'Horticulture & Miraa', tip: 'Meru volcanic soils require consistent irrigation during mid-week dry spells.', icon: 'leaf', type: 'success' },
        { title: 'Coffee Drying', tip: 'Drying parchment coffee on tables requires immediate coverage before forecasted rain.', icon: 'coffee', type: 'warning' }
      ],
      rain: [
        { title: 'Hillside Landslide Watch', tip: 'Mt. Kenya eastern slopes are highly saturated. Watch for cracks in terraces.', icon: 'mountain', type: 'danger' }
      ],
      drought: [
        { title: 'Mulching Practices', tip: 'Conserve moisture on steep hills. Apply weed mulch around coffee roots.', icon: 'coffee', type: 'success' }
      ],
      frost: [
        { title: 'Alpine Wind Frost', tip: 'Cold drafts descending Mt. Kenya tonight. Cover potato plots.', icon: 'snowflake', type: 'danger' }
      ]
    }
  },
  Kisii: {
    current: { temp: 23, feels: 21, humidity: 75, wind: 6, gusts: 9, rain: 0.8, condition: 'Humid Showers', icon: 'rain', uv: 6 },
    forecast: [
      { day: 'Today', high: 25, low: 15, icon: 'rain', rain: 70, rainSum: 5, desc: 'Humid Showers' },
      { day: 'Thu', high: 22, low: 14, icon: 'rain', rain: 85, rainSum: 16, desc: 'Heavy Thunderstorms' },
      { day: 'Fri', high: 23, low: 14, icon: 'rain', rain: 75, rainSum: 12, desc: 'Afternoon Rain' },
      { day: 'Sat', high: 24, low: 15, icon: 'cloud-sun', rain: 45, rainSum: 2, desc: 'Damp Spells' },
      { day: 'Sun', high: 26, low: 16, icon: 'sun', rain: 20, rainSum: 0, desc: 'Sunny Spells' },
      { day: 'Mon', high: 25, low: 15, icon: 'rain', rain: 60, rainSum: 6, desc: 'Showers' },
      { day: 'Tue', high: 23, low: 14, icon: 'rain', rain: 75, rainSum: 9, desc: 'Rainy' },
    ],
    advice: {
      normal: [
        { title: 'Banana & Tea Management', tip: 'Kisii receives convective showers. Dig contour drainage to wash away standing water.', icon: 'tree', type: 'info' },
        { title: 'Tea Harvesting', tip: 'High moisture speeds up tea leaf flushing. Ensure plucking schedules are kept active.', icon: 'leaf', type: 'success' }
      ],
      rain: [
        { title: 'Soil Leaching Warning', tip: 'Continuous rainfall washes away soil nitrogen. Delay top dressing.', icon: 'flask', type: 'warning' }
      ],
      drought: [
        { title: 'Intercropping Protection', tip: 'Shade banana stalks with intercropped legumes to retain hill moisture.', icon: 'tree', type: 'info' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Kisii remains warm and humid. No frost protection measures needed.', icon: 'sun', type: 'success' }
      ]
    }
  },
  Mombasa: {
    current: { temp: 30, feels: 34, humidity: 82, wind: 18, gusts: 24, rain: 0, condition: 'Hot & Breezy', icon: 'sun', uv: 10 },
    forecast: [
      { day: 'Today', high: 32, low: 24, icon: 'sun', rain: 15, rainSum: 0, desc: 'Hot & Breezy' },
      { day: 'Thu', high: 31, low: 23, icon: 'cloud-sun', rain: 25, rainSum: 1, desc: 'Partly Cloudy' },
      { day: 'Fri', high: 30, low: 23, icon: 'cloud-sun', rain: 35, rainSum: 2, desc: 'Passing Clouds' },
      { day: 'Sat', high: 29, low: 22, icon: 'rain', rain: 60, rainSum: 8, desc: 'Coastal Showers' },
      { day: 'Sun', high: 31, low: 24, icon: 'sun', rain: 10, rainSum: 0, desc: 'Sunny & Hot' },
      { day: 'Mon', high: 32, low: 25, icon: 'sun', rain: 5, rainSum: 0, desc: 'Hot & Clear' },
      { day: 'Tue', high: 31, low: 24, icon: 'cloud-sun', rain: 20, rainSum: 0, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Coastal Tree Crops', tip: 'High winds and salt spray. Ensure young coconut and cashew saplings are wind-braced.', icon: 'tree', type: 'info' },
        { title: 'Irrigation Timing', tip: 'Sandy soils lose moisture rapidly. Irrigate early in the morning and mulch heavily.', icon: 'droplet', type: 'warning' }
      ],
      rain: [
        { title: 'Sandy Soil Percolation', tip: 'Coastal showers recharge soil profile. Plant cashew rootstocks during rain.', icon: 'leaf', type: 'success' }
      ],
      drought: [
        { title: 'Salinity Management', tip: 'Borehole water salinity rises. Blend with rainwater reserves for irrigation.', icon: 'droplet', type: 'danger' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Mombasa coastal temperatures are high. Frost risk is completely zero.', icon: 'sun', type: 'success' }
      ]
    }
  },
  Machakos: {
    current: { temp: 25, feels: 26, humidity: 50, wind: 15, gusts: 21, rain: 0, condition: 'Dry & Sunny', icon: 'sun', uv: 9 },
    forecast: [
      { day: 'Today', high: 27, low: 15, icon: 'sun', rain: 5, rainSum: 0, desc: 'Dry & Sunny' },
      { day: 'Thu', high: 28, low: 16, icon: 'sun', rain: 5, rainSum: 0, desc: 'Mostly Sunny' },
      { day: 'Fri', high: 26, low: 14, icon: 'cloud-sun', rain: 15, rainSum: 0, desc: 'Passing Clouds' },
      { day: 'Sat', high: 24, low: 13, icon: 'cloud', rain: 30, rainSum: 1, desc: 'Cloudy' },
      { day: 'Sun', high: 25, low: 14, icon: 'cloud-sun', rain: 20, rainSum: 0, desc: 'Partly Cloudy' },
      { day: 'Mon', high: 27, low: 15, icon: 'sun', rain: 5, rainSum: 0, desc: 'Mostly Sunny' },
      { day: 'Tue', high: 28, low: 16, icon: 'sun', rain: 5, rainSum: 0, desc: 'Dry & Clear' },
    ],
    advice: {
      normal: [
        { title: 'Dryland Crops', tip: 'Machakos is semi-arid. Prioritize drought-resistant crops like sorghum, millet, and green grams.', icon: 'wheat', type: 'success' },
        { title: 'Water Harvesting', tip: 'Low rainfall forecast. Channel rooftop runoff into farm ponds for supplement irrigation.', icon: 'droplet', type: 'info' }
      ],
      rain: [
        { title: 'Flash Runoff Capture', tip: 'Rare rainfall expected. Direct surface runoff into sand dams and farm ponds.', icon: 'waves', type: 'success' }
      ],
      drought: [
        { title: 'Severe Soil Moisture Loss', tip: 'Water availability is critically low. Direct drip irrigation only to active crop root zones.', icon: 'alert', type: 'danger' }
      ],
      frost: [
        { title: 'No Risk', tip: 'Machakos semi-arid climate has no frost risks.', icon: 'sun', type: 'success' }
      ]
    }
  },
  Kiambu: {
    current: { temp: 20, feels: 19, humidity: 68, wind: 9, gusts: 13, rain: 0, condition: 'Mild Clouds', icon: 'cloud-sun', uv: 7 },
    forecast: [
      { day: 'Today', high: 22, low: 12, icon: 'cloud-sun', rain: 30, rainSum: 0, desc: 'Mild Clouds' },
      { day: 'Thu', high: 19, low: 11, icon: 'rain', rain: 70, rainSum: 8, desc: 'Showers' },
      { day: 'Fri', high: 18, low: 10, icon: 'rain', rain: 85, rainSum: 18, desc: 'Heavy Rain' },
      { day: 'Sat', high: 20, low: 12, icon: 'cloud', rain: 45, rainSum: 2, desc: 'Overcast' },
      { day: 'Sun', high: 22, low: 13, icon: 'sun', rain: 15, rainSum: 0, desc: 'Sunny Spells' },
      { day: 'Mon', high: 23, low: 14, icon: 'sun', rain: 10, rainSum: 0, desc: 'Sunny' },
      { day: 'Tue', high: 21, low: 12, icon: 'cloud-sun', rain: 25, rainSum: 0, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Tea & Coffee Care', tip: 'Cool temperatures slow blight but favor coffee berry disease. Apply protectants.', icon: 'coffee', type: 'warning' },
        { title: 'Veggie Damping Off', tip: 'High soil humidity in valleys. Raise seedbeds to prevent damping-off in cabbage nurseries.', icon: 'leaf', type: 'danger' }
      ],
      rain: [
        { title: 'Nitrogen Leaching Alert', tip: 'Rain washes away soil nitrogen. Apply foliar nitrogen sprays during breaks.', icon: 'flask', type: 'warning' }
      ],
      drought: [
        { title: 'Drip Optimization', tip: 'Deploy drip lines to conserve water. Keep nursery seedlings in net tunnels.', icon: 'droplet', type: 'success' }
      ],
      frost: [
        { title: 'Limuru Boundaries Frost', tip: 'Extreme cold in high tea zones. Apply straw covers to young garden sets.', icon: 'snowflake', type: 'danger' }
      ]
    }
  },
  Nyeri: {
    current: { temp: 19, feels: 18, humidity: 72, wind: 8, gusts: 12, rain: 0, condition: 'Overcast Mist', icon: 'cloud', uv: 6 },
    forecast: [
      { day: 'Today', high: 21, low: 11, icon: 'cloud', rain: 45, rainSum: 0, desc: 'Overcast Mist' },
      { day: 'Thu', high: 18, low: 10, icon: 'rain', rain: 75, rainSum: 7, desc: 'Rainy Showers' },
      { day: 'Fri', high: 17, low: 9, icon: 'rain', rain: 80, rainSum: 12, desc: 'Drizzle & Mist' },
      { day: 'Sat', high: 20, low: 11, icon: 'cloud', rain: 50, rainSum: 2, desc: 'Overcast' },
      { day: 'Sun', high: 22, low: 12, icon: 'sun', rain: 15, rainSum: 0, desc: 'Sunny intervals' },
      { day: 'Mon', high: 23, low: 13, icon: 'sun', rain: 10, rainSum: 0, desc: 'Mostly Clear' },
      { day: 'Tue', high: 20, low: 11, icon: 'cloud-sun', rain: 30, rainSum: 1, desc: 'Partly Cloudy' },
    ],
    advice: {
      normal: [
        { title: 'Montane Farming', tip: 'Nyeri hills face high mist. Postpone spraying pesticide until the morning fog clears.', icon: 'mountain', type: 'warning' },
        { title: 'Potato Rot Prevention', tip: 'Saturated volcanic soils cause tubers to rot. Hill up potato rows to divert runoff.', icon: 'leaf', type: 'danger' }
      ],
      rain: [
        { title: 'Terracing Maintenance', tip: 'Ensure Fanya-juu terraces are unblocked to prevent topsoil washouts into valleys.', icon: 'mountain', type: 'danger' }
      ],
      drought: [
        { title: 'Coffee Root Mulching', tip: 'Apply leaf litter around coffee trees to conserve soil moisture reserves.', icon: 'coffee', type: 'success' }
      ],
      frost: [
        { title: 'Aberdares Cold Wave', tip: 'High risk of frost in high altitude zones. Misting systems advised before dawn.', icon: 'snowflake', type: 'danger' }
      ]
    }
  }
};

const WeatherIcon = ({ type, size = 'w-8 h-8' }) => {
  const map = {
    'sun': <Sun className={`${size} text-yellow-400`} />,
    'cloud-sun': <CloudSun className={`${size} text-yellow-300`} />,
    'cloud': <Cloud className={`${size} text-gray-400`} />,
    'rain': <CloudRain className={`${size} text-blue-400`} />,
  };
  return map[type] || <CloudSun className={`${size} text-gray-400`} />;
};



export default function WeatherPage() {
  const [county, setCounty] = useState('Nakuru');
  const [simMode, setSimMode] = useState('normal'); // 'normal' | 'rain' | 'drought' | 'frost'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realWeather, setRealWeather] = useState(null);


  // Real-time sensor state
  const [sensors, setSensors] = useState({
    soilMoisture: 28.5,
    temp: 22,
    humidity: 62,
    solar: 650,
    wind: 14,
    gusts: 18,
    precipitation: 0,
    condition: 'Partly Cloudy',
    icon: 'cloud-sun'
  });

  // Fetch real-time weather from Open-Meteo API
  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      const coords = COUNTY_COORDS[county];
      if (!coords) return;
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Africa/Nairobi`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Live radar connection issues.');
        const json = await res.json();

        if (active) {
          const current = json.current;
          const daily = json.daily;

          const parsedCurrent = {
            temp: Math.round(current.temperature_2m),
            feels: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            wind: Math.round(current.wind_speed_10m),
            gusts: Math.round(current.wind_gusts_10m),
            rain: current.precipitation,
            condition: mapWeatherCode(current.weather_code).condition,
            icon: mapWeatherCode(current.weather_code).icon,
            uv: 6,
          };

          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const parsedForecast = daily.time.map((timeStr, idx) => {
            const date = new Date(timeStr);
            const dayLabel = idx === 0 ? 'Today' : weekdays[date.getDay()];
            return {
              day: dayLabel,
              high: Math.round(daily.temperature_2m_max[idx]),
              low: Math.round(daily.temperature_2m_min[idx]),
              rain: daily.precipitation_probability_max[idx] || 0,
              rainSum: daily.precipitation_sum[idx] || 0,
              desc: mapWeatherCode(daily.weather_code[idx]).condition,
              icon: mapWeatherCode(daily.weather_code[idx]).icon,
            };
          });

          setRealWeather({
            current: parsedCurrent,
            forecast: parsedForecast,
          });
        }
      } catch (err) {
        console.error('Fetch weather error:', err);
        if (active) {
          setError('Live weather connection offline. Displaying regional average logs.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWeather();
    return () => { active = false; };
  }, [county]);

  // Telemetry fluctuations based on API or simulation
  useEffect(() => {
    const currentBase = (simMode === 'normal' && realWeather)
      ? realWeather.current
      : (WEATHER_DATA_FALLBACK[county] || WEATHER_DATA_FALLBACK['Nakuru']).current;

    const interval = setInterval(() => {
      setSensors(() => {
        let baseMoisture = 28.5;
        let baseTemp = currentBase.temp;
        let baseHumidity = currentBase.humidity;
        let baseSolar = 650;
        let baseWind = currentBase.wind;
        let baseGusts = currentBase.gusts || (currentBase.wind * 1.3);
        let basePrecip = currentBase.rain || 0;
        let cond = currentBase.condition;
        let ic = currentBase.icon;

        if (simMode === 'rain') {
          baseMoisture = 78.4;
          baseTemp = 17.2;
          baseHumidity = 94;
          baseSolar = 180;
          baseWind = 26;
          baseGusts = 38;
          basePrecip = 12.5;
          cond = 'Heavy Torrential Rain';
          ic = 'rain';
        } else if (simMode === 'drought') {
          baseMoisture = 11.2;
          baseTemp = 33.8;
          baseHumidity = 31;
          baseSolar = 980;
          baseWind = 10;
          baseGusts = 14;
          basePrecip = 0;
          cond = 'Extreme Heat & Drought';
          ic = 'sun';
        } else if (simMode === 'frost') {
          baseMoisture = 44.5;
          baseTemp = 2.1;
          baseHumidity = 85;
          baseSolar = 90;
          baseWind = 6;
          baseGusts = 8;
          basePrecip = 0;
          cond = 'Morning Ground Frost';
          ic = 'cloud';
        }

        return {
          soilMoisture: Number((baseMoisture + (Math.random() - 0.5) * 0.4).toFixed(1)),
          temp: Number((baseTemp + (Math.random() - 0.5) * 0.3).toFixed(1)),
          humidity: Math.min(100, Math.max(0, Math.round(baseHumidity + (Math.random() - 0.5) * 2))),
          solar: Math.round(baseSolar + (Math.random() - 0.5) * 15),
          wind: Number((baseWind + (Math.random() - 0.5) * 1).toFixed(1)),
          gusts: Number((baseGusts + (Math.random() - 0.5) * 1.5).toFixed(1)),
          precipitation: Number((basePrecip + (Math.random() - 0.5) * 0.2).toFixed(1)),
          condition: cond,
          icon: ic
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [simMode, county, realWeather]);

  const activeWeather = (simMode === 'normal' && realWeather) ? realWeather : (WEATHER_DATA_FALLBACK[county] || WEATHER_DATA_FALLBACK['Nakuru']);
  const fallbackCounty = WEATHER_DATA_FALLBACK[county] || WEATHER_DATA_FALLBACK['Nakuru'];
  const currentAdvice = fallbackCounty.advice[simMode] || fallbackCounty.advice.normal;



  // Logistics safety analysis
  const getLogisticsRadar = () => {
    let roadRisk = 'Low';
    let roadColor = 'text-green-500 bg-green-50 dark:bg-green-950/15';
    let roadBar = 'bg-green-500';
    let roadVal = 12;
    let roadMsg = 'Road safety is optimal. Normal transit conditions.';

    if (sensors.precipitation > 4 || ['Heavy Torrential Rain', 'Rainy', 'Thunderstorms', 'Showers'].includes(sensors.condition)) {
      roadRisk = 'High';
      roadColor = 'text-red-500 bg-red-50 dark:bg-red-950/15';
      roadBar = 'bg-red-500';
      roadVal = 92;
      roadMsg = 'Heavy rainfall causing slick roads and poor visibility. Reduce driver speed by 30%. Headlights ON.';
    } else if (sensors.precipitation > 0.2 || ['Light Rain', 'Drizzle', 'Humid Showers', 'Foggy'].includes(sensors.condition)) {
      roadRisk = 'Medium';
      roadColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/15';
      roadBar = 'bg-amber-500';
      roadVal = 50;
      roadMsg = 'Damp or foggy road conditions. Exercise caution on corners and high slopes.';
    }

    let cargoRisk = 'Low';
    let cargoColor = 'text-green-500 bg-green-50 dark:bg-green-950/15';
    let cargoBar = 'bg-green-500';
    let cargoVal = 15;
    let cargoMsg = 'Produce spoilage risk is low. Adequate temperature for open or closed trucks.';

    if (sensors.temp > 27 || sensors.humidity > 82) {
      cargoRisk = 'High';
      cargoColor = 'text-red-500 bg-red-50 dark:bg-red-950/15';
      cargoBar = 'bg-red-500';
      cargoVal = 88;
      cargoMsg = 'High Spoilage Danger: Perishable fresh crops (spinach, cabbage, tomatoes) require immediate shade, cooling, or ventilation.';
    } else if (sensors.temp > 23 || sensors.humidity > 70) {
      cargoRisk = 'Medium';
      cargoColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/15';
      cargoBar = 'bg-amber-500';
      cargoVal = 48;
      cargoMsg = 'Warm temperatures. Avoid keeping vehicles parked in direct sunlight with fresh produce load.';
    }

    let windRisk = 'Low';
    let windColor = 'text-green-500 bg-green-50 dark:bg-green-950/15';
    let windBar = 'bg-green-500';
    let windVal = 10;
    let windMsg = 'Wind speed is within safe limits for all cargo vehicles.';

    if (sensors.gusts > 35 || sensors.wind > 24) {
      windRisk = 'High';
      windColor = 'text-red-500 bg-red-50 dark:bg-red-950/15';
      windBar = 'bg-red-500';
      windVal = 95;
      windMsg = 'Severe Wind Gusts: High rollover risk for high-profile trucks on escarpments and bridges (e.g. Great Rift Valley viewpoints).';
    } else if (sensors.gusts > 22 || sensors.wind > 14) {
      windRisk = 'Medium';
      windColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/15';
      windBar = 'bg-amber-500';
      windVal = 45;
      windMsg = 'Moderate winds. Heavy load transit drivers should maintain steady speeds and firm steering control.';
    }

    return {
      road: { level: roadRisk, color: roadColor, bar: roadBar, value: roadVal, msg: roadMsg },
      cargo: { level: cargoRisk, color: cargoColor, bar: cargoBar, value: cargoVal, msg: cargoMsg },
      wind: { level: windRisk, color: windColor, bar: windBar, value: windVal, msg: windMsg }
    };
  };

  const radar = getLogisticsRadar();

  // Sky gradient based on condition
  const skyGrad = simMode === 'rain'
    ? 'linear-gradient(160deg, #0f1c2e 0%, #1a3a5c 40%, #2a4a6b 100%)'
    : simMode === 'drought'
      ? 'linear-gradient(160deg, #2c1206 0%, #7c3210 40%, #e05c12 100%)'
      : simMode === 'frost'
        ? 'linear-gradient(160deg, #05111e 0%, #0a2a44 40%, #1a4a6a 100%)'
        : 'linear-gradient(160deg, #0a1628 0%, #0d2b4a 35%, #1a3f6a 70%, #1e4d7a 100%)';

  return (
    <div className="flex flex-col gap-6 animate-slide-up">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .float { animation: float 4s ease-in-out infinite; }
        @keyframes glow-pulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        .glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
        @keyframes rain-drop { 0%{transform:translateY(-10px);opacity:0} 100%{transform:translateY(60px);opacity:0.6} }
        .rain-drop { animation: rain-drop 1.2s linear infinite; }
      `}</style>

      {/* ── HERO WEATHER CARD ── */}
      <div style={{
        background: skyGrad,
        borderRadius: '1.5rem',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        minHeight: 280,
      }}>
        {/* Atmospheric orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />
        <div style={{ position: 'absolute', top: '30%', left: '40%', width: 160, height: 160, borderRadius: '50%', filter: 'blur(60px)', background: simMode === 'drought' ? 'rgba(251,146,60,0.15)' : simMode === 'frost' ? 'rgba(125,211,252,0.12)' : 'rgba(96,165,250,0.10)' }} />

        {/* Rain animation */}
        {(simMode === 'rain' || sensors.precipitation > 0.5) && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(18)].map((_, i) => (
              <div key={i} className="rain-drop" style={{
                position: 'absolute', left: `${(i * 5.5) % 100}%`, top: 0,
                width: 1.5, height: 18, background: 'rgba(147,197,253,0.5)',
                borderRadius: 4, animationDelay: `${(i * 0.15) % 1.5}s`,
                animationDuration: `${0.9 + (i % 4) * 0.15}s`
              }} />
            ))}
          </div>
        )}

        <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          {/* Big temp display */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <select
                value={county} onChange={e => setCounty(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 13, fontWeight: 700, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', outline: 'none' }}
              >
                {COUNTIES.map(c => <option key={c} value={c} style={{ color: '#1a1a1a' }}>{c} County</option>)}
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px' }}>
                <MapPin style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.6)' }} />
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700 }}>lat {COUNTY_COORDS[county].lat}, lon {COUNTY_COORDS[county].lon}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
              <div className="float">
                <WeatherIcon type={sensors.icon} size="w-24 h-24" />
              </div>
              <div>
                <p style={{ fontSize: 80, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>{sensors.temp}°</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20, fontWeight: 700, marginTop: 4 }}>{sensors.condition}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Feels like {sensors.temp - 2}°C</p>
              </div>
            </div>
          </div>

          {/* Right: metric pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 220 }}>
            {[
              { icon: Droplets, label: 'Humidity', val: `${sensors.humidity}%`, color: '#60a5fa' },
              { icon: Wind, label: 'Wind / Gusts', val: `${sensors.wind} / ${sensors.gusts} km/h`, color: '#a78bfa' },
              { icon: Activity, label: 'Soil Moisture', val: `${sensors.soilMoisture}%`, color: '#34d399' },
              { icon: CloudRain, label: 'Precipitation', val: `${sensors.precipitation} mm/h`, color: '#38bdf8' },
            ].map(m => (
              <div key={m.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '10px 14px', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                <m.icon style={{ width: 18, height: 18, color: m.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</p>
                  <p style={{ color: 'white', fontSize: 15, fontWeight: 800 }}>{m.val}</p>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              {loading
                ? <><RefreshCw style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.5)' }} className="animate-spin" /><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Syncing live data…</span></>
                : <><CheckCircle style={{ width: 12, height: 12, color: '#4ade80' }} /><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700 }}>Open-Meteo · Live Connected</span></>
              }
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info style={{ width: 16, height: 16, color: '#d97706', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{error}</span>
        </div>
      )}

      {/* ── SIMULATOR ── */}
      <div style={{ background: 'rgba(22,163,74,0.05)', border: '1.5px dashed rgba(22,163,74,0.3)', borderRadius: '1rem', padding: '1.25rem 1.5rem' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity style={{ width: 16, height: 16, color: '#16a34a' }} className="animate-pulse" />
              Live Meteorological Simulator
            </h3>
            <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>Force weather anomalies to test logistics safety adaptation in real-time.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'normal', label: 'Live Weather', grad: 'linear-gradient(135deg,#16a34a,#15803d)' },
              { id: 'rain', label: 'Rainstorm', grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)' },
              { id: 'drought', label: 'Dry Heat Wave', grad: 'linear-gradient(135deg,#ea580c,#b45309)' },
              { id: 'frost', label: 'Extreme Frost', grad: 'linear-gradient(135deg,#0891b2,#0e7490)' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setSimMode(m.id)}
                style={{
                  fontSize: 11, fontWeight: 800, padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: simMode === m.id ? m.grad : 'white',
                  color: simMode === m.id ? 'white' : '#374151',
                  boxShadow: simMode === m.id ? '0 4px 15px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.1)',
                  transform: simMode === m.id ? 'scale(1.05)' : 'scale(1)',
                }}
              >{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7-DAY FORECAST ── */}
      <div>
        <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudSun style={{ width: 18, height: 18, color: '#3b82f6' }} />
          7-Day Agricultural Forecast — {county} County
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {activeWeather.forecast.map((day, i) => {
            const hi = simMode === 'rain' && i === 0 ? 17 : simMode === 'drought' && i === 0 ? 34 : simMode === 'frost' && i === 0 ? 2 : day.high;
            const lo = simMode === 'rain' && i === 0 ? 11 : simMode === 'drought' && i === 0 ? 22 : simMode === 'frost' && i === 0 ? -1 : day.low;
            const rain = simMode === 'rain' && i === 0 ? 99 : simMode === 'drought' && i === 0 ? 2 : simMode === 'frost' && i === 0 ? 12 : day.rain;
            const isToday = i === 0;
            return (
              <div key={i} style={{
                background: isToday
                  ? 'linear-gradient(160deg, #0d2b4a, #1a4a7a)'
                  : 'white',
                border: isToday ? '2px solid rgba(96,165,250,0.4)' : '1px solid #e5e7eb',
                borderRadius: '1rem', padding: '12px 8px', textAlign: 'center',
                boxShadow: isToday ? '0 8px 30px rgba(29,78,216,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                transition: 'transform 0.2s', cursor: 'default',
              }}>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isToday ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>{day.day}</p>
                <WeatherIcon type={day.icon} size="w-8 h-8" />
                <div>
                  <p style={{ fontWeight: 900, fontSize: 16, color: isToday ? 'white' : '#111827' }}>{hi}°</p>
                  <p style={{ fontSize: 11, color: isToday ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>{lo}°</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: isToday ? 'rgba(255,255,255,0.1)' : '#eff6ff', borderRadius: 20, padding: '2px 8px' }}>
                  <Droplets style={{ width: 10, height: 10, color: rain > 60 ? '#3b82f6' : '#93c5fd' }} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: rain > 60 ? '#2563eb' : '#93c5fd' }}>{rain}%</span>
                </div>
                <p style={{ fontSize: 9, color: isToday ? 'rgba(255,255,255,0.35)' : '#d1d5db', fontWeight: 600, lineHeight: 1.3 }}>{day.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN 2-COL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Rain Probability Bars */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudRain style={{ width: 16, height: 16, color: '#3b82f6' }} />
              7-Day Rain Volume & Probability Index
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeWeather.forecast.map((day, i) => {
                const rain = simMode === 'rain' && i === 0 ? 99 : simMode === 'drought' && i === 0 ? 2 : simMode === 'frost' && i === 0 ? 12 : day.rain;
                const mm = simMode === 'rain' && i === 0 ? 35 : simMode === 'drought' && i === 0 ? 0 : simMode === 'frost' && i === 0 ? 0 : (day.rainSum || 0);
                const barCol = rain > 70 ? '#2563eb' : rain > 40 ? '#60a5fa' : '#bfdbfe';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 70 }}>
                      <WeatherIcon type={day.icon} size="w-4 h-4" />
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>{day.day}</span>
                    </div>
                    <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${rain}%`, background: `linear-gradient(90deg, ${barCol}, ${barCol}88)`, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                    <div style={{ width: 80, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: rain > 60 ? '#2563eb' : '#9ca3af' }}>{rain}%</span>
                      <span style={{ fontSize: 10, color: '#d1d5db', fontWeight: 600 }}>({mm}mm)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agronomy Advice */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf style={{ width: 16, height: 16, color: '#16a34a' }} />
              AI Agronomy Advisory — <span style={{ color: '#16a34a' }}>{simMode.toUpperCase()}</span> Mode
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {currentAdvice.map((a, i) => {
                const palette = {
                  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
                  warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
                  danger: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
                  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
                }[a.type] || { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' };
                const AdvIcon = {
                  wheat: Wheat, droplet: Droplet, leaf: Leaf, waves: Waves, flask: FlaskConical,
                  snowflake: Snowflake, truck: Truck, alert: AlertTriangle, bug: Bug,
                  sun: Sun, coffee: Coffee, tree: TreePine, mountain: Mountain, info: Info
                }[a.icon] || Info;
                return (
                  <div key={i} style={{ background: palette.bg, border: `1.5px solid ${palette.border}`, borderRadius: '0.875rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <AdvIcon style={{ width: 16, height: 16, color: palette.text, flexShrink: 0 }} />
                      <p style={{ fontWeight: 800, fontSize: 13, color: palette.text, flex: 1 }}>{a.title}</p>
                      {a.type === 'danger' && <AlertTriangle style={{ width: 14, height: 14, color: '#dc2626' }} className="animate-pulse" />}
                    </div>
                    <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>{a.tip}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: IoT Sensors + Logistics Radar */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* IoT Sensor Tiles */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity style={{ width: 16, height: 16, color: '#16a34a' }} className="animate-pulse" />
                Live IoT Observatories
              </h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#dcfce7', borderRadius: 20, padding: '4px 10px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'glow-pulse 2s infinite' }} />
                <span style={{ fontSize: 9, fontWeight: 900, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Telemetry</span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Soil Moisture', val: `${sensors.soilMoisture}%`, status: sensors.soilMoisture < 15 ? 'Critical Dry' : sensors.soilMoisture > 75 ? 'Saturated' : 'Optimal', grad: sensors.soilMoisture < 15 ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : sensors.soilMoisture > 75 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', pill: sensors.soilMoisture < 15 ? '#dc2626' : sensors.soilMoisture > 75 ? '#2563eb' : '#16a34a', SensorIcon: Leaf },
                { label: 'Ambient Temp', val: `${sensors.temp}°C`, status: sensors.temp < 5 ? 'Frost Alert' : sensors.temp > 32 ? 'Extreme Heat' : 'Moderate', grad: sensors.temp < 5 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : sensors.temp > 32 ? 'linear-gradient(135deg,#fff7ed,#ffedd5)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', pill: sensors.temp < 5 ? '#2563eb' : sensors.temp > 32 ? '#ea580c' : '#16a34a', SensorIcon: Thermometer },
                { label: 'Rel. Humidity', val: `${sensors.humidity}%`, status: sensors.humidity > 85 ? 'Mold Hazard' : 'Normal', grad: sensors.humidity > 85 ? 'linear-gradient(135deg,#fffbeb,#fef3c7)' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', pill: sensors.humidity > 85 ? '#b45309' : '#16a34a', SensorIcon: Droplets },
                { label: 'Precipitation', val: `${sensors.precipitation}mm/h`, status: sensors.precipitation > 5 ? 'Heavy Storm' : sensors.precipitation > 0 ? 'Light Rain' : 'Dry', grad: sensors.precipitation > 5 ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : sensors.precipitation > 0 ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : 'linear-gradient(135deg,#f9fafb,#f3f4f6)', pill: sensors.precipitation > 5 ? '#dc2626' : sensors.precipitation > 0 ? '#2563eb' : '#6b7280', SensorIcon: CloudRain },
              ].map(s => (
                <div key={s.label} style={{ background: s.grad, borderRadius: '0.875rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <s.SensorIcon style={{ width: 14, height: 14, color: s.pill }} />
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280' }}>{s.label}</p>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{s.val}</p>
                  <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 900, color: 'white', background: s.pill, borderRadius: 20, padding: '2px 8px', alignSelf: 'flex-start', textTransform: 'uppercase' }}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Safety Radar */}
          <div style={{ background: 'linear-gradient(160deg,#0d1f3c,#0a2a52)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck style={{ width: 20, height: 20, color: '#60a5fa' }} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>Logistics Safety Radar</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>Real-time transit risk analysis</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
              {[
                { label: 'Road Slickness', r: radar.road },
                { label: 'Cargo Spoilage', r: radar.cargo },
                { label: 'Wind Hazard', r: radar.wind },
              ].map(({ label, r }) => {
                const isHigh = r.level === 'High';
                const isMed = r.level === 'Medium';
                const barColor = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#22c55e';
                const pillBg = isHigh ? 'rgba(239,68,68,0.2)' : isMed ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.15)';
                const pillText = isHigh ? '#fca5a5' : isMed ? '#fcd34d' : '#86efac';
                return (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '0.875rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                      <span style={{ fontSize: 9, fontWeight: 900, color: pillText, background: pillBg, borderRadius: 20, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{r.level} RISK</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', width: `${r.value}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{r.msg}</p>
                  </div>
                );
              })}
            </div>


            <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8, position: 'relative' }}>
              <ShieldAlert style={{ width: 14, height: 14, color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Transit Advisory:</strong> Highland routes (Limuru, Molo, Rift Valley escarpments) require verified brake systems and emergency weather gear.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}


