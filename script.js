const locationStatus = document.getElementById('location-status');
const tideStatus = document.getElementById('tide-status');
const tideTimes = document.getElementById('tide-times');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const weatherStatus = document.getElementById('weather-status');
const temperature = document.getElementById('temperature');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

const weatherApiKey = '556892949cec457fa9253210251407'; // Replace this

// 1. Get geolocation
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    locationStatus.textContent = "Geolocation is not supported.";
  }
}

// 2. Reverse geocode (WeatherAPI supports lat/lon)
async function fetchWeather(lat, lon) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${lat},${lon}&days=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const locationName = data.location.name;
    locationStatus.textContent = `📍 Location: ${locationName}`;
    weatherStatus.textContent = data.current.condition.text;
    temperature.textContent = `Temp: ${data.current.temp_c}°C`;

    sunriseEl.textContent = `Sunrise: ${data.forecast.forecastday[0].astro.sunrise}`;
    sunsetEl.textContent = `Sunset: ${data.forecast.forecastday[0].astro.sunset}`;

    // Now fetch tide info
    fetchTide(lat, lon);
  } catch (err) {
    locationStatus.textContent = 'Unable to fetch weather data.';
  }
}


async function fetchTide(lat, lon) {
  const tideApiKey = '9da25882-6074-11f0-bed1-0242ac130006-9da25936-6074-11f0-bed1-0242ac130006'; // Replace with your actual key

  // Create start and end timestamps for the current day
  const now = new Date();
  const startTimestamp = Math.floor(new Date(now.setHours(0, 0, 0, 0)).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(now.setHours(23, 59, 59, 999)).getTime() / 1000);

  const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lon}&start=${startTimestamp}&end=${endTimestamp}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: tideApiKey
      }
    });

    const data = await res.json();

    if (data && data.data && data.data.length > 0) {
      const tidesToday = data.data;

      tideStatus.textContent = '🌊 Tide Schedule Today:';
      tideTimes.innerHTML = tidesToday.map(tide =>
        `• ${tide.type === 'high' ? '⬆️ High tide' : '⬇️ Low tide'} at ${new Date(tide.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      ).join('<br>');
    } else {
      tideStatus.textContent = 'No tide data available';
      tideTimes.textContent = '';
    }
  } catch (err) {
    tideStatus.textContent = 'Failed to fetch tide data';
    tideTimes.textContent = '';
  }
}



// Handle location
function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchWeather(lat, lon);
}

function error() {
  locationStatus.textContent = 'Failed to get your location.';
}

// Search functionality
searchButton.addEventListener('click', async () => {
  const city = searchInput.value;
  if (!city) return;

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${city}&days=1`;
    const res = await fetch(url);
    const data = await res.json();

    locationStatus.textContent = `📍 Location: ${data.location.name}`;
    weatherStatus.textContent = data.current.condition.text;
    temperature.textContent = `Temp: ${data.current.temp_c}°C`;
    sunriseEl.textContent = `Sunrise: ${data.forecast.forecastday[0].astro.sunrise}`;
    sunsetEl.textContent = `Sunset: ${data.forecast.forecastday[0].astro.sunset}`;
    tideStatus.textContent = 'Tide data coming soon...';
    tideTimes.textContent = '';
  } catch {
    locationStatus.textContent = 'Error fetching data.';
  }
});

// Run on load
getLocation();
