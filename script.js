const LATITUDE = 53.7796;
const LONGITUDE = -1.5165;
const LOCATION_NAME = "Leeds, LS10 1BL";
const WEATHER_REFRESH_MS = 30 * 60 * 1000;

const weatherCodes = {
  0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",
  51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",56:"Freezing drizzle",57:"Freezing drizzle",
  61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",
  71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",
  80:"Rain showers",81:"Rain showers",82:"Heavy showers",85:"Snow showers",86:"Heavy snow showers",
  95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"
};

function updateClock(){
  const now=new Date();
  clock.textContent=now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false});
  weekday.textContent=now.toLocaleDateString("en-GB",{weekday:"long"});
  date.textContent=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
}

function animatedWeatherIcon(code,isDay=1){
  let name="cloudy";
  if(code===0) name=isDay?"clear-day":"clear-night";
  else if(code===1||code===2) name=isDay?"partly-day":"partly-night";
  else if(code===3||code===45||code===48) name="cloudy";
  else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) name="rain";
  else if([71,73,75,77,85,86].includes(code)) name="snow";
  else if([95,96,99].includes(code)) name="storm";
  return `<img class="weather-image" src="weather-icons/${name}.svg" alt="" aria-hidden="true">`;
}

function setWeatherAmbience(code,isDay){
  document.body.className="";
  let c="weather-cloudy";
  if(code===0||code===1)c="weather-clear";
  else if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))c="weather-rain";
  else if([71,73,75,77,85,86].includes(code))c="weather-snow";
  else if([95,96,99].includes(code))c="weather-storm";
  document.body.classList.add(c);
  if(!isDay)document.body.classList.add("weather-night");
}

function shortTime(iso){return iso?iso.slice(11,16):"--:--"}
function windDirection(deg){const d=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];return d[Math.round(deg/22.5)%16]}

async function loadWeather(){
  const params=new URLSearchParams({
    latitude:LATITUDE,longitude:LONGITUDE,
    current:"temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m",
    daily:"weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    timezone:"auto",forecast_days:"6",wind_speed_unit:"kmh"
  });
  try{
    status.textContent="Updating weather…";
    const r=await fetch(`https://api.open-meteo.com/v1/forecast?${params}&_=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error(r.status);
    const data=await r.json(),c=data.current;
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

    forecast.innerHTML="";
    for(let i=1;i<Math.min(6,data.daily.time.length);i++){
      const d=new Date(`${data.daily.time[i]}T12:00:00`);
      const el=document.createElement("div");
      el.className="forecast-day";
      el.innerHTML=`<div class="forecast-name">${d.toLocaleDateString("en-GB",{weekday:"long"})}</div>
      <div class="forecast-date">${d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}).toUpperCase()}</div>
      <div class="forecast-icon">${animatedWeatherIcon(data.daily.weather_code[i],1)}</div>
      <div class="forecast-temps">${Math.round(data.daily.temperature_2m_max[i])}°<span class="low">${Math.round(data.daily.temperature_2m_min[i])}°</span></div>
      <div class="rain"><span>◊</span>${data.daily.precipitation_probability_max[i]??0}%</div>`;
      forecast.appendChild(el);
    }
    status.textContent=`Live weather • Updated ${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`;
  }catch(e){
    console.error(e);
    status.textContent="Weather unavailable • Retrying automatically";
  }
}
function fitDashboard(){document.documentElement.style.setProperty("--scale",Math.min(innerWidth/1280,innerHeight/800))}
updateClock();setInterval(updateClock,1000);fitDashboard();addEventListener("resize",fitDashboard);
loadWeather();setInterval(loadWeather,WEATHER_REFRESH_MS);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadWeather()});
setTimeout(()=>location.reload(),6*60*60*1000);




function runGlassSwish(){
  const sweep=document.querySelector(".glass-swish");
  if(!sweep)return;
  sweep.classList.remove("is-sweeping");
  void sweep.offsetWidth;
  sweep.classList.add("is-sweeping");
  window.setTimeout(()=>sweep.classList.remove("is-sweeping"),2600);
}

// Immediate visual proof after loading, then every 30 seconds.
window.setTimeout(runGlassSwish,1500);
window.setInterval(runGlassSwish,30000);
