const API_KEY = '9edf0a9becc84159879100259251705'; // Replace with your actual API key

function getWeather() {
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;
  fetchWeather(city);
}

async function fetchWeather(cityName) {
  showLoading();
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=3&aqi=no&alerts=no&hour=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.status !== 200 || data.error) {
      throw new Error(data.error?.message || "City not found");
    }

    updateWeather(data);
    updateForecast(data);
    updateHourly(data);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

function updateWeather(data) {
  document.getElementById("weather-info").style.display = "block";
  document.getElementById("error").style.display = "none";

  const location = data.location;
  const current = data.current;

  document.getElementById("city-name").textContent = location.name;
  document.getElementById("date").textContent = location.localtime;
  document.getElementById("temperature").textContent = `${current.temp_c}°C`;
  document.getElementById("weather-description").textContent = current.condition.text;
  document.getElementById("weather-icon").src = current.condition.icon;

  document.getElementById("feels-like").textContent = `${current.feelslike_c}°C`;
  document.getElementById("humidity").textContent = `${current.humidity}%`;
  document.getElementById("wind-speed").textContent = `${current.wind_kph} km/h`;
  document.getElementById("uv-index").textContent = current.uv;
}

function updateForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  data.forecast.forecastday.forEach(day => {
    const el = document.createElement("div");
    el.className = "forecast-day";
    el.innerHTML = `
      <h3>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</h3>
      <img src="${day.day.condition.icon}" alt="Icon" />
      <p>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(day.day.mintemp_c)}°C</p>
      <p>${day.day.condition.text}</p>
    `;
    forecastContainer.appendChild(el);
  });
}

function updateHourly(data) {
  const hourlyContainer = document.getElementById("hourly-forecast");
  hourlyContainer.innerHTML = "";

  const now = new Date(data.location.localtime);
  const currentHour = now.getHours();
  const todayDate = now.toISOString().split("T")[0]; // e.g., "2025-05-17"

  const todayHours = data.forecast.forecastday[0].hour;

  const upcomingHours = todayHours.filter(hourData => {
    const hourTime = new Date(hourData.time);
    const hour = hourTime.getHours();
    const date = hourTime.toISOString().split("T")[0];
    return date === todayDate && hour >= currentHour;
  });

  if (upcomingHours.length === 0) {
    hourlyContainer.innerHTML = "<p>No more hourly data available for today.</p>";
    return;
  }

  upcomingHours.forEach(hourData => {
    const hour = new Date(hourData.time);
    const hourFormatted = hour.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });

    const el = document.createElement("div");
    el.className = "forecast-hour";
    el.innerHTML = `
      <p><strong>${hourFormatted}</strong></p>
      <img src="${hourData.condition.icon}" alt="${hourData.condition.text}" />
      <p>${hourData.temp_c}°C</p>
    `;
    hourlyContainer.appendChild(el);
  });
}



function showLoading() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("weather-info").style.display = "none";
  document.getElementById("error").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
}

function showError(message) {
  document.getElementById("error").textContent = message;
  document.getElementById("error").style.display = "block";
  document.getElementById("weather-info").style.display = "none";
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const themeIcon = document.getElementById("toggle-theme");
  themeIcon.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}
