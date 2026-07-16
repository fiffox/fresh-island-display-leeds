const LATITUDE = 53.7796;
const LONGITUDE = -1.5165;
const LOCATION_NAME = "Leeds, LS10 1BL";
const WEATHER_REFRESH_MS = 10 * 60 * 1000;

const weatherCodes = {
  0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",
  51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",56:"Freezing drizzle",57:"Freezing drizzle",
  61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",
  71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",
  80:"Rain showers",81:"Rain showers",82:"Heavy showers",
  85:"Snow showers",86:"Heavy snow showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"
};

function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false});
  document.getElementById("weekday").textContent = now.toLocaleDateString("en-GB",{weekday:"long"});
  document.getElementById("date").textContent = now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
}
function shortTime(iso) { return iso ? iso.slice(11,16) : "--:--"; }
function windDirection(deg) {
  const dirs=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg/22.5)%16];
}
function animatedWeatherIcon(code,isDay=1) {
  const sun='<span class="sun-rays"></span><span class="sun-core"></span>';
  const moon='<span class="moon-core"></span>';
  const cloud='<span class="cloud-body"></span>';
  const rain='<span class="drop d1"></span><span class="drop d2"></span><span class="drop d3"></span>';
  const snow='<span class="flake f1">✦</span><span class="flake f2">✦</span><span class="flake f3">✦</span>';
  const fog='<span class="fog-line f1"></span><span class="fog-line f2"></span><span class="fog-line f3"></span>';
  if(code===0) return `<span class="wx-icon clear">${isDay?sun:moon}</span>`;
  if(code===1||code===2) return `<span class="wx-icon partly">${isDay?sun:moon}${cloud}</span>`;
  if(code===3) return `<span class="wx-icon cloudy">${cloud}</span>`;
  if(code===45||code===48) return `<span class="wx-icon fog">${cloud}${fog}</span>`;
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return `<span class="wx-icon rain">${cloud}${rain}</span>`;
  if([71,73,75,77,85,86].includes(code)) return `<span class="wx-icon snow">${cloud}${snow}</span>`;
  if([95,96,99].includes(code)) return `<span class="wx-icon storm">${cloud}<span class="bolt"></span>${rain}</span>`;
  return `<span class="wx-icon cloudy">${cloud}</span>`;
}
function setWeatherAmbience(code,isDay) {
  document.body.className="";
  let cls="weather-cloudy";
  if(code===0||code===1) cls="weather-clear";
  else if([2,3,45,48].includes(code)) cls="weather-cloudy";
  else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) cls="weather-rain";
  else if([71,73,75,77,85,86].includes(code)) cls="weather-snow";
  else if([95,96,99].includes(code)) cls="weather-storm";
  document.body.classList.add(cls);
  if(!isDay) document.body.classList.add("weather-night");
}
async function loadWeather() {
  const status=document.getElementById("status");
  const params=new URLSearchParams({
    latitude:LATITUDE,longitude:LONGITUDE,
    current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m",
    daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone:"auto",forecast_days:"6",wind_speed_unit:"kmh"
  });
  try {
    status.textContent="Updating weather…";
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params}&_=${Date.now()}`,{cache:"no-store"});
    if(!response.ok) throw new Error(response.status);
    const data=await response.json(), c=data.current;
    setWeatherAmbience(c.weather_code,c.is_day);
    document.getElementById("location-name").textContent=LOCATION_NAME;
    document.getElementById("current-temp").textContent=Math.round(c.temperature_2m);
    document.getElementById("current-icon").innerHTML=animatedWeatherIcon(c.weather_code,c.is_day);
    document.getElementById("condition").textContent=weatherCodes[c.weather_code]||"Weather";
    document.getElementById("feels-like").textContent=Math.round(c.apparent_temperature);
    document.getElementById("wind").textContent=`${windDirection(c.wind_direction_10m)} ${Math.round(c.wind_speed_10m)} km/h`;
    document.getElementById("humidity").textContent=`${Math.round(c.relative_humidity_2m)}%`;
    document.getElementById("pressure").textContent=`${Math.round(c.surface_pressure)} hPa`;
    document.getElementById("visibility").textContent=`${Math.round((c.visibility||0)/1000)} km`;
    document.getElementById("sunrise").textContent=shortTime(data.daily.sunrise[0]);
    document.getElementById("sunset").textContent=shortTime(data.daily.sunset[0]);
    const forecast=document.getElementById("forecast");
    forecast.innerHTML="";
    for(let i=1;i<Math.min(6,data.daily.time.length);i++){
      const d=new Date(`${data.daily.time[i]}T12:00:00`);
      const el=document.createElement("div");
      el.className="forecast-day";
      el.innerHTML=`
        <div class="forecast-name">${d.toLocaleDateString("en-GB",{weekday:"long"})}</div>
        <div class="forecast-date">${d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}).toUpperCase()}</div>
        <div class="forecast-icon">${animatedWeatherIcon(data.daily.weather_code[i],1)}</div>
        <div class="forecast-temps">${Math.round(data.daily.temperature_2m_max[i])}°<span class="low">${Math.round(data.daily.temperature_2m_min[i])}°</span></div>
        <div class="rain"><span>◊</span>${data.daily.precipitation_probability_max[i]??0}%</div>`;
      forecast.appendChild(el);
    }
    status.textContent=`Live weather • Updated ${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`;
  } catch(error) {
    console.error(error);
    status.textContent="Weather unavailable • Retrying automatically";
  }
}
function fitDashboard() {
  const scale=Math.min(window.innerWidth/1280,window.innerHeight/800);
  document.documentElement.style.setProperty("--scale",scale);
}

/* Periodic screen-protection motion */
const SWEEP_MIN_MS=8*60*1000, SWEEP_MAX_MS=14*60*1000, PIXEL_SHIFT_MS=5*60*1000;
const shifts=[[0,0],[2,0],[2,2],[0,2],[-2,2],[-2,0],[-2,-2],[0,-2],[2,-2]];
let shiftIndex=0;
function runScreenSweep(){
  const sweep=document.getElementById("screen-protection-sweep");
  if(!sweep)return;
  sweep.classList.remove("is-active");
  void sweep.offsetWidth;
  sweep.classList.add("is-active");
  setTimeout(()=>sweep.classList.remove("is-active"),6000);
  setTimeout(runScreenSweep,SWEEP_MIN_MS+Math.random()*(SWEEP_MAX_MS-SWEEP_MIN_MS));
}
function shiftDashboardPixels(){
  const dashboard=document.getElementById("dashboard");
  shiftIndex=(shiftIndex+1)%shifts.length;
  const [x,y]=shifts[shiftIndex];
  dashboard.style.translate=`${x}px ${y}px`;
}

updateClock();
setInterval(updateClock,1000);
fitDashboard();
addEventListener("resize",fitDashboard);
loadWeather();
setInterval(loadWeather,WEATHER_REFRESH_MS);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadWeather();});
setTimeout(()=>location.reload(),6*60*60*1000);
setTimeout(runScreenSweep,90*1000);
setInterval(shiftDashboardPixels,PIXEL_SHIFT_MS);
