const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cardsContainer = document.getElementById("cardsContainer");
const messageEl = document.getElementById("message");

function getWeatherIcon(main) {
  const map = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️"
  };
  return map[main] || "🌡️";
}

function showMessage(text, type = "loading") {
  messageEl.innerHTML = `<span class="msg-${type}">${text}</span>`;
  if (type !== "loading") {
    setTimeout(() => { messageEl.innerHTML = ""; }, 4000);
  }
}

function createCard(data) {
  const icon = getWeatherIcon(data.weather[0].main);
  const temp = Math.round(data.main.temp);
  const desc = data.weather[0].description;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;

  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4";
  col.innerHTML = `
    <div class="weather-card h-100">
      <button class="close-btn"><i class="fas fa-times"></i></button>
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <div class="city-name">${data.name}</div>
          <div class="country">${data.sys.country}</div>
        </div>
        <div class="weather-icon">${icon}</div>
      </div>
      <div class="temp mt-2">${temp}°C</div>
      <div class="desc">${desc}</div>
      <div class="extra-info">
        <i class="fas fa-tint me-1"></i> ${humidity}% &nbsp;&nbsp;
        <i class="fas fa-wind me-1"></i> ${wind} m/s
      </div>
    </div>
  `;

  col.querySelector(".close-btn").addEventListener("click", () => col.remove());
  return col;
}

async function fetchWeather(city) {
  if (!city.trim()) {
    showMessage("⚠️ Escribe el nombre de una ciudad", "error");
    return;
  }

  if (!API_KEY || API_KEY === "tu_api_key_aqui") {
    showMessage("❌ Configura tu API Key en el archivo .env", "error");
    return;
  }

  showMessage("⏳ Consultando clima...", "loading");

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${API_KEY}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) throw new Error("Ciudad no encontrada");
      if (res.status === 401) throw new Error("API Key inválida");
      throw new Error("Error al consultar el clima");
    }

    const data = await res.json();
    messageEl.innerHTML = "";
    cardsContainer.prepend(createCard(data));
    cityInput.value = "";
  } catch (err) {
    showMessage(`❌ ${err.message}`, "error");
  }
}

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchWeather(cityInput.value);
});