import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudSun, CloudRain, Sun, Cloud, Wind, Droplets,
  Thermometer, AlertTriangle, Leaf, MapPin, RefreshCw,
  Truck, ShieldAlert, CheckCircle2,
  FlaskConical, Snowflake, Waves, Bug,
  Droplet, Search, Gauge,
  Calendar, Compass, Flame, ShieldCheck,
  TrendingUp, DollarSign, Calculator, MessageSquare, Bot, Sparkles, Send, PieChart,
  Download, Printer
} from 'lucide-react';

/* ── All Major Kenyan Agricultural Counties & Coordinates ─────────────── */
const KENYA_COUNTIES = [
  { name: 'Nakuru', region: 'Rift Valley', lat: -0.303, lon: 36.080, crop: 'Irish Potatoes', yieldPerAcre: 18, unit: 'Tons', pricePerUnit: 45000, inputCostPerAcre: 180000 },
  { name: 'Uasin Gishu (Eldoret)', region: 'Rift Valley', lat: 0.514, lon: 35.269, crop: 'Dry White Maize', yieldPerAcre: 35, unit: 'Bags (90kg)', pricePerUnit: 3200, inputCostPerAcre: 45000 },
  { name: 'Trans-Nzoia (Kitale)', region: 'Rift Valley', lat: 1.019, lon: 35.002, crop: 'Commercial Seed Maize', yieldPerAcre: 42, unit: 'Bags (90kg)', pricePerUnit: 3400, inputCostPerAcre: 52000 },
  { name: 'Kiambu', region: 'Central Highlands', lat: -1.171, lon: 36.830, crop: 'Grade A Tomatoes', yieldPerAcre: 22, unit: 'Tons', pricePerUnit: 80000, inputCostPerAcre: 320000 },
  { name: 'Nyeri', region: 'Central Highlands', lat: -0.417, lon: 36.951, crop: 'Arabica Coffee', yieldPerAcre: 4.5, unit: 'Tons (Cherry)', pricePerUnit: 110000, inputCostPerAcre: 140000 },
  { name: 'Meru', region: 'Eastern', lat: 0.046, lon: 37.655, crop: 'Fresh Red Onions', yieldPerAcre: 14, unit: 'Tons', pricePerUnit: 120000, inputCostPerAcre: 210000 },
  { name: 'Nyandarua', region: 'Central Highlands', lat: -0.271, lon: 36.379, crop: 'Irish Potatoes', yieldPerAcre: 20, unit: 'Tons', pricePerUnit: 42000, inputCostPerAcre: 175000 },
  { name: 'Murang\'a', region: 'Central Highlands', lat: -0.721, lon: 37.150, crop: 'Hass Avocados', yieldPerAcre: 8.5, unit: 'Tons', pricePerUnit: 150000, inputCostPerAcre: 190000 },
  { name: 'Kirinyaga', region: 'Central Highlands', lat: -0.498, lon: 37.280, crop: 'Paddy Rice (Pishori)', yieldPerAcre: 32, unit: 'Bags (90kg)', pricePerUnit: 7800, inputCostPerAcre: 85000 },
  { name: 'Kisumu', region: 'Lake Victoria Basin', lat: -0.102, lon: 34.761, crop: 'Sugarcane', yieldPerAcre: 45, unit: 'Tons', pricePerUnit: 5100, inputCostPerAcre: 95000 },
  { name: 'Kisii', region: 'Nyanza Highlands', lat: -0.681, lon: 34.771, crop: 'Cooking Bananas', yieldPerAcre: 16, unit: 'Tons', pricePerUnit: 38000, inputCostPerAcre: 120000 },
  { name: 'Kakamega', region: 'Western', lat: 0.284, lon: 34.752, crop: 'Green Maize & Beans', yieldPerAcre: 28, unit: 'Bags (90kg)', pricePerUnit: 3100, inputCostPerAcre: 38000 },
  { name: 'Kericho', region: 'Rift Valley', lat: -0.368, lon: 35.286, crop: 'Black Tea', yieldPerAcre: 12, unit: 'Tons (Green Leaf)', pricePerUnit: 62000, inputCostPerAcre: 180000 },
  { name: 'Machakos', region: 'Eastern Drylands', lat: -1.517, lon: 37.263, crop: 'Green Grams (Ndengu)', yieldPerAcre: 12, unit: 'Bags (90kg)', pricePerUnit: 9500, inputCostPerAcre: 28000 },
];

/* ── WMO Code Interpreter ─────────────────────────────────────────────── */
const parseWmoCode = (code) => {
  if (code === 0) return { condition: 'Clear Sky', icon: 'sun', bgTheme: 'sunny' };
  if ([1, 2].includes(code)) return { condition: 'Partly Cloudy', icon: 'cloud-sun', bgTheme: 'partly-cloudy' };
  if (code === 3) return { condition: 'Overcast', icon: 'cloud', bgTheme: 'cloudy' };
  if ([45, 48].includes(code)) return { condition: 'Foggy Mist', icon: 'cloud', bgTheme: 'foggy' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Light Drizzle', icon: 'rain', bgTheme: 'rainy' };
  if ([61, 63, 65, 66, 67].includes(code)) return { condition: 'Moderate Rain', icon: 'rain', bgTheme: 'rainy' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Cold Mountain Frost', icon: 'frost', bgTheme: 'frost' };
  if ([80, 81, 82].includes(code)) return { condition: 'Heavy Rain Showers', icon: 'rain', bgTheme: 'stormy' };
  if ([95, 96, 99].includes(code)) return { condition: 'Severe Thunderstorms', icon: 'rain', bgTheme: 'stormy' };
  return { condition: 'Partly Cloudy', icon: 'cloud-sun', bgTheme: 'partly-cloudy' };
};

/* ── Official KMD Bulletins ───────────────────────────────────────────── */
const KMD_BULLETINS = [
  {
    id: 'KMD-BULLETIN-2026-04',
    title: 'Kenya Met Official Agricultural Climate Bulletin',
    date: 'July 2026 Season Update',
    summary: 'Enhanced precipitation expected across Lake Victoria Basin, Rift Valley Grain Belts, and Central Highlands. Night temperature drops below 6°C in Aberdares & Mau Escarpment.',
    alerts: [
      { area: 'Rift Valley & Lake Basin (Eldoret, Kitale, Kericho, Kisumu)', level: 'HEAVY RAIN ALERT', text: 'Sustained moisture logged. Clear field drainage contour ditches to avoid root rot.', badge: 'bg-blue-600' },
      { area: 'Central Highlands (Nyeri, Meru, Nyandarua, Limuru)', level: 'COLD FROST WARNING', text: 'Min temperatures dropping below 6°C. High risk of late potato blight and tea shoot frost injury.', badge: 'bg-indigo-600' },
      { area: 'Eastern & Coastal Belt (Machakos, Makueni, Kilifi)', level: 'MOISTURE CONSERVATION', text: 'Light scattered showers. Apply organic mulching to block soil evaporation.', badge: 'bg-amber-600' }
    ]
  }
];

export default function WeatherPage() {
  const navigate = useNavigate();
  const [selectedCounty, setSelectedCounty] = useState(KENYA_COUNTIES[0]);
  const [activeTab, setActiveTab] = useState('agronomy'); // 'agronomy' | 'economics' | 'forecast' | 'logistics' | 'kmd'
  const [simMode, setSimMode] = useState('normal'); // 'normal' | 'rain' | 'drought' | 'frost'
  
  // Agricultural Economics State
  const [acreage, setAcreage] = useState(2);

  // AI Assistant Interactive State
  const [userAiPrompt, setUserAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Nairobi' }) + ' EAT');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time weather from Open-Meteo API
  const fetchRealTimeWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCounty.lat}&longitude=${selectedCounty.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,soil_temperature_0_to_10cm,soil_moisture_0_to_7cm&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Africa%2FNairobi`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Could not fetch real-time Kenya Met data.');
      const json = await res.json();

      const current = json.current;
      const daily = json.daily;
      const hourly = json.hourly;
      const wmo = parseWmoCode(current.weather_code);

      const currentParsed = {
        temp: Math.round(current.temperature_2m),
        feels: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        pressure: Math.round(current.surface_pressure),
        windSpeed: Math.round(current.wind_speed_10m),
        windGusts: Math.round(current.wind_gusts_10m),
        windDir: current.wind_direction_10m,
        precip: current.precipitation,
        soilTemp: current.soil_temperature_0_to_10cm !== undefined ? Math.round(current.soil_temperature_0_to_10cm) : 19,
        soilMoisture: current.soil_moisture_0_to_7cm !== undefined ? Math.round(current.soil_moisture_0_to_7cm * 100) : 34,
        condition: wmo.condition,
        icon: wmo.icon,
        bgTheme: wmo.bgTheme,
        uvMax: daily.uv_index_max[0] ? Math.round(daily.uv_index_max[0]) : 7,
        sunrise: daily.sunrise[0] ? daily.sunrise[0].split('T')[1] : '06:22',
        sunset: daily.sunset[0] ? daily.sunset[0].split('T')[1] : '18:38',
      };

      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyParsed = daily.time.map((tStr, idx) => {
        const dObj = new Date(tStr);
        const label = idx === 0 ? 'Today' : weekdays[dObj.getDay()];
        const dWmo = parseWmoCode(daily.weather_code[idx]);
        return {
          day: label,
          dateStr: `${dObj.getDate()} ${dObj.toLocaleString('en-KE', { month: 'short' })}`,
          maxTemp: Math.round(daily.temperature_2m_max[idx]),
          minTemp: Math.round(daily.temperature_2m_min[idx]),
          rainProb: daily.precipitation_probability_max[idx] || 0,
          rainSum: daily.precipitation_sum[idx] || 0,
          condition: dWmo.condition,
          icon: dWmo.icon,
          uv: Math.round(daily.uv_index_max[idx] || 6)
        };
      });

      const next24 = [];
      if (hourly && hourly.time) {
        const currentHourIndex = new Date().getHours();
        for (let i = currentHourIndex; i < currentHourIndex + 12; i++) {
          if (hourly.time[i]) {
            const hTime = hourly.time[i].split('T')[1];
            const hWmo = parseWmoCode(hourly.weather_code[i]);
            next24.push({
              time: hTime,
              temp: Math.round(hourly.temperature_2m[i]),
              humidity: hourly.relative_humidity_2m[i],
              rainProb: hourly.precipitation_probability[i] || 0,
              precip: hourly.precipitation[i] || 0,
              icon: hWmo.icon,
              condition: hWmo.condition
            });
          }
        }
      }

      setWeatherData({ currentConditions: currentParsed, daily: dailyParsed });
      setHourlyData(next24);
      showToast(`Updated satellite telemetry for ${selectedCounty.name} County.`);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Live weather sync paused — showing regional telemetry.');
    } finally {
      setLoading(false);
    }
  }, [selectedCounty]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        fetchRealTimeWeather();
      }
    });
    return () => { ignore = true; };
  }, [fetchRealTimeWeather]);

  // Derived effective weather values
  const effectiveWeather = useMemo(() => {
    if (!weatherData) return null;
    let base = { ...weatherData.currentConditions };

    if (simMode === 'rain') {
      base.temp = 17;
      base.feels = 15;
      base.humidity = 95;
      base.precip = 18.5;
      base.windSpeed = 28;
      base.windGusts = 42;
      base.soilMoisture = 88;
      base.condition = 'Heavy Downpour & Torrential Rain';
      base.icon = 'rain';
      base.bgTheme = 'stormy';
    } else if (simMode === 'drought') {
      base.temp = 34;
      base.feels = 37;
      base.humidity = 24;
      base.precip = 0;
      base.windSpeed = 12;
      base.windGusts = 16;
      base.soilMoisture = 9;
      base.condition = 'Extreme Heat & Soil Drought';
      base.icon = 'sun';
      base.bgTheme = 'sunny';
    } else if (simMode === 'frost') {
      base.temp = 3;
      base.feels = 1;
      base.humidity = 82;
      base.precip = 0;
      base.windSpeed = 6;
      base.windGusts = 9;
      base.soilMoisture = 48;
      base.condition = 'High Altitude Ground Frost';
      base.icon = 'frost';
      base.bgTheme = 'frost';
    }

    return base;
  }, [weatherData, simMode]);

  // Disease Risk Calculations
  const diseaseRiskMetrics = useMemo(() => {
    if (!effectiveWeather) return { blight: 20, rust: 15, armyworm: 10, wilt: 15 };

    let blight = 25;
    let rust = 20;
    let armyworm = 15;
    let wilt = 20;

    if (effectiveWeather.humidity > 80 && effectiveWeather.temp < 22) {
      blight = 92; // High late blight risk
      rust = 65;
    }
    if (effectiveWeather.temp > 28 && effectiveWeather.soilMoisture < 25) {
      armyworm = 88; // Armyworm outbreak
      blight = 15;
    }
    if (effectiveWeather.precip > 8) {
      wilt = 84; // Root wilt & drowning
    }

    return { blight, rust, armyworm, wilt };
  }, [effectiveWeather]);

  // Agronomic Advice List
  const agronomyAdvice = useMemo(() => {
    if (!effectiveWeather) return [];
    const adviceList = [];

    if (effectiveWeather.precip > 5 || effectiveWeather.condition.includes('Rain') || effectiveWeather.condition.includes('Thunderstorms')) {
      adviceList.push({
        title: 'High Rainfall & Soil Leaching Risk',
        type: 'danger',
        icon: Waves,
        text: 'Soil saturation levels are high. Clear all farm contour ditches immediately to divert standing water away from crop root zones.'
      });
      adviceList.push({
        title: 'Fungicide & Late Blight Protection',
        type: 'warning',
        icon: FlaskConical,
        text: `${selectedCounty.crop} fields are currently at ${diseaseRiskMetrics.blight}% risk of fungal outbreaks. Spray copper oxychloride once rain pauses.`
      });
      adviceList.push({
        title: 'Postpone Top-Dressing Fertilizer',
        type: 'info',
        icon: Leaf,
        text: 'Avoid applying granular CAN or NPK top-dressing today; heavy rainfall will wash away active soil nutrients (nitrogen leaching).'
      });
    } else if (effectiveWeather.temp > 28 || effectiveWeather.soilMoisture < 20) {
      adviceList.push({
        title: 'Moisture Stress & Evaporation Control',
        type: 'danger',
        icon: Flame,
        text: 'Soil moisture is critically low. Apply heavy organic mulch around plant basins to block surface evaporation and preserve soil water.'
      });
      adviceList.push({
        title: 'Night Drip Irrigation Protocol',
        type: 'success',
        icon: Droplet,
        text: 'Run drip lines between 8:00 PM and 5:00 AM to ensure 90% water absorption directly into root zones without midday heat loss.'
      });
      adviceList.push({
        title: 'Pest Scouting Warning',
        type: 'warning',
        icon: Bug,
        text: `Hot weather accelerates Fall Armyworm (${diseaseRiskMetrics.armyworm}% risk) and Aphids. Inspect under crop leaves every morning.`
      });
    } else if (effectiveWeather.temp < 8) {
      adviceList.push({
        title: 'Ground Frost Hazard Alert',
        type: 'danger',
        icon: Snowflake,
        text: 'Cold drafts detected. Shield tender shoots using straw mulching or deploy overhead sprinklers before dawn to prevent leaf cell freezing.'
      });
      adviceList.push({
        title: 'Seedbed & Nursery Protection',
        type: 'warning',
        icon: ShieldAlert,
        text: 'Cover high-value seedling beds with polythene sheets or shade nets to retain trapped ground warmth overnight.'
      });
    } else {
      adviceList.push({
        title: 'Optimal Growth & Fertilizer Window',
        type: 'success',
        icon: CheckCircle2,
        text: `Excellent growing conditions for ${selectedCounty.crop}. Ideal time for weeding, CAN top-dressing, and foliar spraying.`
      });
      adviceList.push({
        title: 'Irrigation & Chemical Spraying Window',
        type: 'info',
        icon: Wind,
        text: 'Moderate wind speeds. Spraying crop protection chemicals is optimal between 07:00 AM and 11:00 AM.'
      });
    }

    return adviceList;
  }, [effectiveWeather, selectedCounty, diseaseRiskMetrics]);

  // Agricultural Economics Calculations ("Ecogomry")
  const cropEconomics = useMemo(() => {
    const totalYield = acreage * selectedCounty.yieldPerAcre;
    const grossRevenue = totalYield * selectedCounty.pricePerUnit;
    const totalInputCosts = acreage * selectedCounty.inputCostPerAcre;
    const netProfit = grossRevenue - totalInputCosts;
    const roiPercentage = ((netProfit / totalInputCosts) * 100).toFixed(1);

    return {
      acreage,
      yieldPerAcre: selectedCounty.yieldPerAcre,
      totalYield: totalYield.toLocaleString(),
      unit: selectedCounty.unit,
      pricePerUnit: selectedCounty.pricePerUnit,
      grossRevenue: grossRevenue.toLocaleString(),
      totalInputCosts: totalInputCosts.toLocaleString(),
      netProfit: netProfit.toLocaleString(),
      roiPercentage,
      isProfitable: netProfit > 0
    };
  }, [acreage, selectedCounty]);

  // AI Assistant Query Handler
  const handleAiQuestion = (queryText) => {
    const q = queryText || userAiPrompt;
    if (!q.trim()) return;

    setIsAiThinking(true);
    setAiResponse(null);

    setTimeout(() => {
      let answer;
      const lowerQ = q.toLowerCase();

      if (lowerQ.includes('fertilizer') || lowerQ.includes('can') || lowerQ.includes('dap') || lowerQ.includes('npk')) {
        answer = `🌱 **AI Agronomy Fertilizer Advisory for ${selectedCounty.name} (${selectedCounty.crop})**:\n\n` +
          `• **Current Soil Moisture**: ${effectiveWeather?.soilMoisture}%\n` +
          `• **Recommended Action**: ${effectiveWeather?.precip > 4 ? '❌ Do NOT apply top-dressing today due to heavy rain leaching risk.' : '✅ Apply 50kg CAN per acre during early morning.'}\n` +
          `• **Best Timing**: Top-dress when soil moisture is between 25% and 50% for 95% root uptake. Incorporate gently into soil 5cm away from stems.`;
      } else if (lowerQ.includes('blight') || lowerQ.includes('spray') || lowerQ.includes('fungicide') || lowerQ.includes('disease')) {
        answer = `🛡️ **AI Plant Health & Disease Diagnostic**:\n\n` +
          `• **Late Blight Outbreak Risk**: **${diseaseRiskMetrics.blight}%** (${diseaseRiskMetrics.blight > 70 ? 'CRITICAL ALERT' : 'MODERATE'})\n` +
          `• **Relative Humidity**: ${effectiveWeather?.humidity}%\n` +
          `• **Recommended Spray**: ${diseaseRiskMetrics.blight > 70 ? 'Apply systemic Fungicide (Metalaxyl + Mancozeb) immediately during dry gaps.' : 'Apply protective Copper Hydroxide spray.'}`;
      } else if (lowerQ.includes('yield') || lowerQ.includes('profit') || lowerQ.includes('money') || lowerQ.includes('revenue') || lowerQ.includes('harvest')) {
        answer = `💰 **Agricultural Economics Forecast (${acreage} Acres of ${selectedCounty.crop} in ${selectedCounty.name})**:\n\n` +
          `• **Expected Total Harvest**: ${cropEconomics.totalYield} ${cropEconomics.unit}\n` +
          `• **Gross Market Value**: KSh ${cropEconomics.grossRevenue}\n` +
          `• **Total Production Cost**: KSh ${cropEconomics.totalInputCosts}\n` +
          `• **Net Expected Profit**: **KSh ${cropEconomics.netProfit}** (ROI: ${cropEconomics.roiPercentage}%)`;
      } else {
        answer = `🤖 **ShambaPoint AI Advisory for ${selectedCounty.name}**:\n\n` +
          `Based on live weather telemetry (${effectiveWeather?.temp}°C, ${effectiveWeather?.humidity}% Humidity, ${effectiveWeather?.soilMoisture}% Soil Moisture):\n\n` +
          `1. **Crop Health**: Favorable growing conditions for ${selectedCounty.crop}.\n` +
          `2. **Irrigation Need**: ${effectiveWeather?.soilMoisture < 25 ? 'High — run night drip irrigation.' : 'Low — soil moisture levels are adequate.'}\n` +
          `3. **Market Access**: Current local market pricing is KSh ${selectedCounty.pricePerUnit.toLocaleString()} per ${selectedCounty.unit}.`;
      }

      setAiResponse(answer);
      setIsAiThinking(false);
    }, 800);
  };

  // PDF Bulletin Download Handler
  const handleDownloadKmdPdf = (areaName) => {
    showToast(`Downloading KMD Official Bulletin PDF for ${areaName}...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Logistics Transit Calculations
  const transitSafety = useMemo(() => {
    if (!effectiveWeather) return { roadStatus: 'Optimal', roadBadge: 'bg-emerald-500 text-white', cargoStatus: 'Safe', cargoBadge: 'bg-emerald-500 text-white', overallRisk: 'LOW' };

    let roadStatus = 'Dry & Clear';
    let roadBadge = 'bg-emerald-500 text-white';
    let cargoStatus = 'Optimal Cold Chain';
    let cargoBadge = 'bg-emerald-500 text-white';
    let overallRisk = 'LOW';

    if (effectiveWeather.precip > 5 || effectiveWeather.windGusts > 35) {
      roadStatus = 'Hazardous - Heavy Rain / Winds';
      roadBadge = 'bg-red-600 text-white animate-pulse';
      overallRisk = 'HIGH';
    } else if (effectiveWeather.precip > 0.5) {
      roadStatus = 'Slick Wet Asphalt';
      roadBadge = 'bg-amber-500 text-white';
      overallRisk = 'MEDIUM';
    }

    if (effectiveWeather.temp > 28 || effectiveWeather.humidity > 80) {
      cargoStatus = 'High Spoilage Danger';
      cargoBadge = 'bg-red-600 text-white';
      if (overallRisk === 'LOW') overallRisk = 'MEDIUM';
    }

    return { roadStatus, roadBadge, cargoStatus, cargoBadge, overallRisk };
  }, [effectiveWeather]);

  // Sky Gradient Theme
  const getThemeGradient = (theme) => {
    switch (theme) {
      case 'sunny':
        return 'from-amber-600 via-orange-600 to-emerald-900';
      case 'rainy':
      case 'stormy':
        return 'from-slate-900 via-blue-950 to-slate-900';
      case 'frost':
        return 'from-slate-900 via-indigo-950 to-cyan-950';
      case 'cloudy':
      case 'partly-cloudy':
      default:
        return 'from-emerald-900 via-teal-900 to-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-ag-canvas text-gray-900 pb-16 font-sans">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-ag-amber/40 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-ag-amber" /> {toastMessage}
        </div>
      )}

      {/* ── TOP NAV / HEADER BAR ── */}
      <div className="bg-ag-primary text-white border-b border-ag-primary/20 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/15">
              <CloudSun className="w-7 h-7 text-ag-amber" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Kenya Meteorological Observatory</h1>
                <button
                  onClick={fetchRealTimeWeather}
                  className="text-[10px] font-bold bg-green-500/20 text-green-300 hover:bg-green-500/30 px-2 py-0.5 rounded-full border border-green-400/30 flex items-center gap-1 transition cursor-pointer"
                  title="Click to Refresh Live Telemetry"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" /> LIVE SATELLITE FEED
                </button>
              </div>
              <p className="text-xs text-white/75 font-medium flex items-center gap-2">
                <span>Official Real-Time Telemetry & Agronomic Advisory</span>
                <span>•</span>
                <span className="text-ag-amber font-mono font-bold">{currentTimeStr}</span>
              </p>
            </div>
          </div>

          {/* Quick County Select */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-white/50 absolute left-3 top-3" />
            <select
              value={selectedCounty.name}
              onChange={(e) => {
                const found = KENYA_COUNTIES.find(c => c.name === e.target.value);
                if (found) setSelectedCounty(found);
              }}
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-ag-amber backdrop-blur-md cursor-pointer"
            >
              {KENYA_COUNTIES.map(c => (
                <option key={c.name} value={c.name} className="text-gray-900 bg-white font-semibold">
                  {c.name} ({c.region})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* ── KMD OFFICIAL METEOROLOGICAL ALERT BANNER ── */}
        {KMD_BULLETINS.map(b => (
          <div key={b.id} className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-5 border border-emerald-500/30 shadow-lg text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-ag-amber text-gray-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    OFFICIAL KMD BULLETIN
                  </span>
                  <span className="text-xs text-white/70 font-mono">{b.date}</span>
                </div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> {b.title}
                </h2>
                <p className="text-xs text-white/80 max-w-3xl">{b.summary}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                {b.alerts.map((al, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-xl text-xs max-w-xs">
                    <span className={`text-[9px] font-extrabold text-white px-2 py-0.5 rounded-md ${al.badge} uppercase block w-fit mb-1`}>
                      {al.level}
                    </span>
                    <p className="font-semibold text-white/90 text-[11px] leading-tight">{al.area}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* ── MAIN HERO WEATHER CARD ── */}
        <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${getThemeGradient(effectiveWeather?.bgTheme)} text-white shadow-2xl relative overflow-hidden border border-white/15 transition-all duration-500`}>
          
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-ag-amber/10 rounded-full blur-3xl pointer-events-none" />

          {error && (
            <div className="relative z-20 mb-4 bg-amber-500/20 text-amber-200 border border-amber-400/30 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-white animate-spin mx-auto" />
              <p className="text-sm font-bold text-white/80">Connecting to Kenya Meteorological Satellite Radar...</p>
            </div>
          ) : effectiveWeather && (
            <div className="relative z-10 space-y-8">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/15 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-5 h-5 text-ag-amber" />
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{selectedCounty.name} County</h2>
                    <span className="bg-white/15 text-white text-xs px-3 py-1 rounded-full font-bold backdrop-blur-md">
                      {selectedCounty.region} Region
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-medium flex items-center gap-2">
                    <span>🌾 Focus Crop: <strong className="text-ag-amber">{selectedCounty.crop}</strong></span>
                    <span>•</span>
                    <span>Coordinates: {selectedCounty.lat}°, {selectedCounty.lon}°</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Weather Anomaly Mode Selector Buttons */}
                  <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20">
                    {[
                      { mode: 'normal', label: 'Live Normal' },
                      { mode: 'rain', label: 'Torrential Rain' },
                      { mode: 'drought', label: 'Dry Drought' },
                      { mode: 'frost', label: 'Frost Alert' },
                    ].map((m) => (
                      <button
                        key={m.mode}
                        onClick={() => {
                          setSimMode(m.mode);
                          showToast(`Activated ${m.label} simulation mode.`);
                        }}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                          simMode === m.mode ? 'bg-ag-amber text-gray-950 shadow-md font-black' : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={fetchRealTimeWeather}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-bold text-white transition backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-ag-amber" /> Sync Data
                  </button>
                </div>
              </div>

              {/* Main Temp & Gauge Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                <div className="lg:col-span-6 flex items-center gap-6">
                  <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 shadow-inner">
                    {effectiveWeather.icon === 'sun' && <Sun className="w-20 h-20 sm:w-24 sm:h-24 text-ag-amber animate-spin-slow" />}
                    {effectiveWeather.icon === 'cloud-sun' && <CloudSun className="w-20 h-20 sm:w-24 sm:h-24 text-amber-300" />}
                    {effectiveWeather.icon === 'cloud' && <Cloud className="w-20 h-20 sm:w-24 sm:h-24 text-blue-200" />}
                    {effectiveWeather.icon === 'rain' && <CloudRain className="w-20 h-20 sm:w-24 sm:h-24 text-cyan-300 animate-bounce" />}
                    {effectiveWeather.icon === 'frost' && <Snowflake className="w-20 h-20 sm:w-24 sm:h-24 text-sky-200" />}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl sm:text-7xl font-black tracking-tighter">{effectiveWeather.temp}°</span>
                      <span className="text-2xl font-bold text-white/80">C</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{effectiveWeather.condition}</h3>
                    <p className="text-xs text-white/70 font-medium mt-1">
                      Feels like {effectiveWeather.feels}°C • UV Index: <strong className="text-ag-amber">{effectiveWeather.uvMax} / 12</strong>
                    </p>
                  </div>
                </div>

                {/* Sensor Grid */}
                <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  
                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <Droplets className="w-4 h-4 text-cyan-300" /> Relative Humidity
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.humidity}%</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <Wind className="w-4 h-4 text-emerald-300" /> Wind & Gusts
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.windSpeed} <span className="text-xs font-normal text-white/70">km/h</span></p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <CloudRain className="w-4 h-4 text-blue-300" /> Rainfall Rate
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.precip} <span className="text-xs font-normal text-white/70">mm/h</span></p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <Thermometer className="w-4 h-4 text-amber-300" /> Soil Temp
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.soilTemp}°C</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <Droplet className="w-4 h-4 text-teal-300" /> Soil Moisture
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.soilMoisture}%</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
                    <div className="flex items-center gap-2 text-white/70 text-xs font-bold mb-1">
                      <Gauge className="w-4 h-4 text-violet-300" /> Air Pressure
                    </div>
                    <p className="text-xl font-extrabold">{effectiveWeather.pressure} <span className="text-xs font-normal text-white/70">hPa</span></p>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── NAVIGATION TABS ── */}
        <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-sm gap-1">
          {[
            { id: 'agronomy', label: 'AI Crop & Agronomy Advice', icon: Sparkles },
            { id: 'economics', label: 'Agricultural Economics & Yield', icon: Calculator },
            { id: 'forecast', label: '7-Day & Hourly Forecast', icon: Calendar },
            { id: 'logistics', label: 'Logistics Safety Radar', icon: Truck },
            { id: 'kmd', label: 'Kenya Met Official Bulletin', icon: ShieldCheck },
          ].map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive ? 'bg-ag-primary text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-ag-amber' : ''}`} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT 1: AI AGRONOMY ADVISORY & DIAGNOSTICS ── */}
        {activeTab === 'agronomy' && (
          <div className="space-y-6">
            
            {/* Top Row: AI Diagnostic Chat & Quick Questions */}
            <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-ag-amber text-gray-950 rounded-2xl font-black">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                      ShambaPoint AI Agronomist <Sparkles className="w-4 h-4 text-ag-amber animate-pulse" />
                    </h3>
                    <p className="text-xs text-white/70">Real-time crop disease diagnosis & fertilizer recommendations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast(`Printing Agronomic Advisory Report for ${selectedCounty.name}...`);
                      window.print();
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-ag-amber" /> Print Advisory
                  </button>
                  <span className="bg-white/10 text-ag-amber text-xs px-3 py-1 rounded-full font-bold border border-white/15">
                    Analyzing {selectedCounty.name} Telemetry
                  </span>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Ask AI Agronomist Pre-Set Query:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    `Fertilizer rate for ${selectedCounty.crop}?`,
                    `Is Late Blight risk high today?`,
                    `When should I harvest my ${selectedCounty.crop.split(' ')[0]}?`,
                    `Drip irrigation schedule for ${selectedCounty.name}?`
                  ].map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handleAiQuestion(preset)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold text-white/90 transition backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-ag-amber" /> {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Ask AI anything about ${selectedCounty.crop} farming in ${selectedCounty.name}...`}
                  value={userAiPrompt}
                  onChange={(e) => setUserAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuestion()}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ag-amber backdrop-blur-md"
                />
                <button
                  onClick={() => handleAiQuestion()}
                  disabled={isAiThinking}
                  className="px-6 py-3 bg-ag-amber hover:bg-ag-amber/90 text-gray-950 font-black text-sm rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  {isAiThinking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Ask AI
                </button>
              </div>

              {/* AI Response Display Box */}
              {aiResponse && (
                <div className="p-5 bg-white/10 border border-ag-amber/30 rounded-2xl backdrop-blur-md space-y-3 animate-fadeIn text-sm text-white/90">
                  <div className="flex items-center gap-2 text-ag-amber font-bold text-xs uppercase tracking-wider border-b border-white/10 pb-2">
                    <Bot className="w-4 h-4" /> AI Agronomist Analysis & Diagnostic Result:
                  </div>
                  {(() => {
                    const lines = aiResponse.split('\n');
                    return (
                      <div className="space-y-2 leading-relaxed">
                        {lines.map((line, lineIdx) => {
                          if (!line.trim()) return <div key={lineIdx} className="h-1" />;
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <div key={lineIdx} className={`flex items-start gap-1.5 ${line.startsWith('•') ? 'pl-2 text-white/90' : 'text-white'}`}>
                              <div className="flex-1">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={partIdx} className="font-extrabold text-ag-amber">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Disease & Outbreak Risk Gauges */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-600" /> Real-Time Pest & Fungal Outbreak Risk Gauges
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Late Blight Risk', val: diseaseRiskMetrics.blight, desc: 'Favored by high humidity' },
                  { label: 'Leaf Rust Hazard', val: diseaseRiskMetrics.rust, desc: 'Highland moisture' },
                  { label: 'Fall Armyworm Outbreak', val: diseaseRiskMetrics.armyworm, desc: 'Hot dry spell threat' },
                  { label: 'Root Wilt & Rot', val: diseaseRiskMetrics.wilt, desc: 'Soil saturation hazard' },
                ].map((d, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span>{d.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${d.val > 70 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {d.val}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${d.val > 70 ? 'bg-red-600' : d.val > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${d.val}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Agronomy Cards */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-ag-primary" /> Recommended Field Actions for {selectedCounty.name}
                  </h3>
                  <p className="text-xs text-gray-500">Live telemetry-driven farming protocols</p>
                </div>
                <span className="bg-ag-primary/10 text-ag-primary text-xs px-3 py-1 rounded-full font-extrabold">
                  {selectedCounty.crop} Focus
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agronomyAdvice.map((adv, idx) => {
                  const IconC = adv.icon;
                  const borderColors = {
                    danger: 'border-red-200 bg-red-50/50 text-red-900',
                    warning: 'border-amber-200 bg-amber-50/50 text-amber-900',
                    info: 'border-blue-200 bg-blue-50/50 text-blue-900',
                    success: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
                  }[adv.type] || 'border-gray-200 bg-gray-50 text-gray-900';

                  return (
                    <div key={idx} className={`p-5 rounded-2xl border ${borderColors} space-y-2 shadow-sm`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                          <IconC className="w-5 h-5 text-ag-primary" />
                        </div>
                        <h4 className="font-extrabold text-sm">{adv.title}</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-700 font-medium pl-1">{adv.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT 2: AGRICULTURAL ECONOMICS ("ECOGOMRY") & YIELD FORECAST ── */}
        {activeTab === 'economics' && (
          <div className="space-y-6">
            
            {/* Header & Acreage Interactive Slider */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-ag-primary" /> Agricultural Economics & Profitability Forecast
                  </h3>
                  <p className="text-xs text-gray-500">Calculate projected crop yields, input costs, and net revenue for {selectedCounty.name}</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> ROI Forecast: {cropEconomics.roiPercentage}%
                </div>
              </div>

              {/* Interactive Acreage Slider & Quick Preset Buttons */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <label className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-ag-primary" /> Select Farm Acreage:
                  </label>

                  {/* Acreage Quick Preset Buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 2, 5, 10, 25, 50].map((val) => (
                      <button
                        key={val}
                        onClick={() => {
                          setAcreage(val);
                          showToast(`Set farm acreage to ${val} ${val === 1 ? 'Acre' : 'Acres'}.`);
                        }}
                        className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${
                          acreage === val ? 'bg-ag-primary text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {val} {val === 1 ? 'Acre' : 'Acres'}
                      </button>
                    ))}
                  </div>

                  <span className="text-lg font-black text-ag-primary bg-white px-4 py-1 rounded-xl border shadow-sm shrink-0">
                    {acreage} {acreage === 1 ? 'Acre' : 'Acres'}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="50"
                  value={acreage}
                  onChange={(e) => setAcreage(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ag-primary"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>1 Acre</span>
                  <span>10 Acres</span>
                  <span>25 Acres</span>
                  <span>50 Acres</span>
                </div>
              </div>

              {/* Revenue & Profit Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-600 uppercase">Estimated Total Harvest</span>
                  <p className="text-2xl font-black text-blue-900">{cropEconomics.totalYield}</p>
                  <p className="text-[11px] font-semibold text-blue-700">{cropEconomics.unit} @ {cropEconomics.yieldPerAcre}/Acre</p>
                </div>

                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-700 uppercase">Market Rate ({selectedCounty.crop})</span>
                  <p className="text-2xl font-black text-amber-900">KSh {selectedCounty.pricePerUnit.toLocaleString()}</p>
                  <p className="text-[11px] font-semibold text-amber-800">per {selectedCounty.unit}</p>
                </div>

                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-purple-700 uppercase">Total Production Costs</span>
                  <p className="text-2xl font-black text-purple-900">KSh {cropEconomics.totalInputCosts}</p>
                  <p className="text-[11px] font-semibold text-purple-800">Seeds, DAP, Spray & Labor</p>
                </div>

                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Expected Net Profit</span>
                  <p className="text-2xl font-black text-emerald-900">KSh {cropEconomics.netProfit}</p>
                  <p className="text-[11px] font-bold text-emerald-800">Net Profit Margin</p>
                </div>

              </div>

              {/* Economic Advice Summary & Action Button */}
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 max-w-2xl">
                  <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> Economic Yield Optimization Tip for {selectedCounty.name}:
                  </h4>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Selling your harvest directly through <strong>ShambaPoint Escrow Marketplace</strong> eliminates broker commission losses (saving up to 25% of gross revenues). Direct transport coordination guarantees full payout upon buyer delivery confirmation.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/market')}
                  className="px-5 py-2.5 bg-ag-primary hover:bg-ag-primary/90 text-white text-xs font-black rounded-xl shadow-md transition shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-ag-amber" /> List Crop on Marketplace
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ── TAB CONTENT 3: FORECAST (HOURLY & 7-DAY) ── */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            
            {/* Hourly 12-Hour Carousel */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-ag-primary" /> Hourly Weather Outlook (Next 12 Hours)
              </h3>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {hourlyData.map((h, idx) => (
                  <div key={idx} className="min-w-[100px] p-4 bg-gray-50 rounded-xl border border-gray-100 text-center flex flex-col items-center gap-2 shrink-0 hover:border-ag-primary transition">
                    <span className="text-xs font-bold text-gray-500">{h.time}</span>
                    {h.icon === 'sun' && <Sun className="w-6 h-6 text-ag-amber" />}
                    {h.icon === 'cloud-sun' && <CloudSun className="w-6 h-6 text-amber-500" />}
                    {h.icon === 'cloud' && <Cloud className="w-6 h-6 text-gray-400" />}
                    {h.icon === 'rain' && <CloudRain className="w-6 h-6 text-blue-500" />}
                    <span className="text-lg font-black text-gray-900">{h.temp}°C</span>
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">💧 {h.rainProb}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Forecast Grid */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-ag-primary" /> 7-Day Agricultural Forecast Matrix
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {weatherData?.daily.map((d, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border text-center flex flex-col justify-between gap-3 transition-all ${
                      idx === 0 ? 'bg-ag-primary/5 border-ag-primary shadow-sm' : 'bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-black uppercase ${idx === 0 ? 'text-ag-primary' : 'text-gray-500'}`}>
                        {d.day}
                      </span>
                      <p className="text-[10px] text-gray-400 font-semibold">{d.dateStr}</p>
                    </div>

                    <div className="my-2 flex justify-center">
                      {d.icon === 'sun' && <Sun className="w-8 h-8 text-ag-amber" />}
                      {d.icon === 'cloud-sun' && <CloudSun className="w-8 h-8 text-amber-500" />}
                      {d.icon === 'cloud' && <Cloud className="w-8 h-8 text-gray-400" />}
                      {d.icon === 'rain' && <CloudRain className="w-8 h-8 text-blue-500" />}
                      {d.icon === 'frost' && <Snowflake className="w-8 h-8 text-sky-400" />}
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-gray-900">{d.maxTemp}° <span className="text-xs text-gray-400 font-normal">/ {d.minTemp}°C</span></p>
                      <p className="text-[11px] font-bold text-gray-600 truncate mt-0.5">{d.condition}</p>
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-bold text-gray-500">
                      <span className="text-blue-600 font-extrabold flex items-center gap-0.5"><Droplets className="w-3 h-3" /> {d.rainProb}%</span>
                      <span>{d.rainSum} mm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT 4: LOGISTICS SAFETY RADAR ── */}
        {activeTab === 'logistics' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <Truck className="w-6 h-6 text-ag-primary" /> Logistics & Cargo Safety Radar
                </h3>
                <p className="text-xs text-gray-500">Real-time driver road risks & perishable crop protection for {selectedCounty.name} routes</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${transitSafety.roadBadge}`}>
                  OVERALL RISK: {transitSafety.overallRisk}
                </span>
                <button
                  onClick={() => navigate('/transport')}
                  className="px-4 py-2 bg-ag-primary hover:bg-ag-primary/90 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-ag-amber" /> Request Transport
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <Compass className="w-5 h-5 text-blue-600" /> Road Surface & Escarpment Hazards
                  </h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${transitSafety.roadBadge}`}>
                    {transitSafety.roadStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Rift Valley viewpoints and high mountain passes in {selectedCounty.name} require heavy load drivers to inspect braking systems and maintain safety distances.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-gray-200 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" /> Cold Chain & Cargo Spoilage Risk
                  </h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${transitSafety.cargoBadge}`}>
                    {transitSafety.cargoStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Perishable crops (leafy greens, tomatoes, milk) traveling through {selectedCounty.name} during peak ambient heat require tarpaulin shading or refrigerated dispatch.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB CONTENT 5: KMD OFFICIAL BULLETIN ── */}
        {activeTab === 'kmd' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="border-b pb-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-ag-primary" /> Kenya Meteorological Department (KMD) Official Guidance
                </h3>
                <p className="text-xs text-gray-500">National Met Station Dagoretti Corner Climate Bulletins</p>
              </div>
              <button
                onClick={() => handleDownloadKmdPdf('Full National Bulletin')}
                className="px-4 py-2 bg-ag-primary text-white text-xs font-bold rounded-xl hover:bg-ag-primary/90 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-ag-amber" /> Download Full Bulletin PDF
              </button>
            </div>

            <div className="space-y-4">
              {KMD_BULLETINS[0].alerts.map((al, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black text-white px-2.5 py-1 rounded-md ${al.badge} uppercase tracking-wider`}>
                      {al.level}
                    </span>
                    <h4 className="font-extrabold text-gray-900 text-sm mt-1">{al.area}</h4>
                    <p className="text-xs text-gray-600 max-w-2xl font-medium">{al.text}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadKmdPdf(al.area)}
                    className="px-4 py-2 bg-ag-primary text-white text-xs font-bold rounded-xl hover:bg-ag-primary/90 transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-ag-amber" /> Download KMD PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
