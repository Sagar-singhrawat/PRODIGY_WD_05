
// ========================================
// DOM ELEMENTS
// ========================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const weatherCard = document.getElementById("weatherCard");
const welcomeMessage = document.getElementById("welcomeMessage");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");

const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const windDirection = document.getElementById("windDirection");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");


// ========================================
// API URLS
// ========================================

// Open-Meteo Geocoding API
const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

// Open-Meteo Weather API
const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        showError("Please enter a city name.");

        return;
    }

    getWeatherByCity(city);
});


// ========================================
// ENTER KEY SEARCH
// ========================================

cityInput.addEventListener("keypress", (event) => {

    if (event.key === "Enter") {

        searchBtn.click();

    }

});


// ========================================
// GET WEATHER BY CITY
// ========================================

async function getWeatherByCity(city) {

    try {

        showLoading();

        clearError();

        /*
         * STEP 1
         * Convert city name into latitude
         * and longitude.
         */

        const geoURL =
            `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {

            throw new Error("Unable to find location.");

        }

        const geoData = await geoResponse.json();


        // Check if city exists

        if (!geoData.results || geoData.results.length === 0) {

            throw new Error(
                "City not found. Please check the spelling."
            );

        }


        // Get location information

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const name = location.name;

        const country = location.country;


        /*
         * STEP 2
         * Now that we have latitude and longitude,
         * request weather information.
         */

        await getWeather(
            latitude,
            longitude,
            name,
            country
        );


    } catch (error) {

        showError(error.message);

    } finally {

        hideLoading();

    }

}


// ========================================
// GET WEATHER USING COORDINATES
// ========================================

async function getWeather(
    latitude,
    longitude,
    name,
    country
) {

    /*
     * Request current weather
     * and today's sunrise/sunset.
     */

    const weatherURL =
        `${WEATHER_API}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m` +
        `&daily=sunrise,sunset` +
        `&timezone=auto`;


    const response = await fetch(weatherURL);


    if (!response.ok) {

        throw new Error(
            "Unable to fetch weather information."
        );

    }


    const data = await response.json();


    // Update UI

    displayWeather(
        data,
        name,
        country
    );

}


// ========================================
// DISPLAY WEATHER
// ========================================

function displayWeather(
    data,
    name,
    country
) {

    const current = data.current;
    const daily = data.daily;


    // Location

    cityName.textContent = name;

    countryName.textContent = country;


    // Temperature

    temperature.textContent =
        Math.round(current.temperature_2m);


    // Feels like

    feelsLike.textContent =
        Math.round(current.apparent_temperature);


    // Humidity

    humidity.textContent =
        current.relative_humidity_2m;


    // Wind

    windSpeed.textContent =
        Math.round(current.wind_speed_10m);


    // Wind direction

    windDirection.textContent =
        Math.round(current.wind_direction_10m);


    // Weather condition

    const weatherInfo =
        getWeatherDescription(
            current.weather_code
        );


    condition.textContent =
        weatherInfo.description;


    weatherIcon.textContent =
        weatherInfo.icon;


    // Sunrise

    sunrise.textContent =
        formatTime(daily.sunrise[0]);


    // Sunset

    sunset.textContent =
        formatTime(daily.sunset[0]);


    // Show weather card

    weatherCard.classList.remove("hidden");

    welcomeMessage.classList.add("hidden");

}


// ========================================
// WEATHER CODE CONVERTER
// ========================================

function getWeatherDescription(code) {

    /*
     * Open-Meteo uses WMO weather codes.
     *
     * We convert those numeric codes
     * into human-readable conditions.
     */

    const weatherCodes = {

        0: {
            description: "Clear Sky",
            icon: "☀️"
        },

        1: {
            description: "Mainly Clear",
            icon: "🌤️"
        },

        2: {
            description: "Partly Cloudy",
            icon: "⛅"
        },

        3: {
            description: "Overcast",
            icon: "☁️"
        },

        45: {
            description: "Foggy",
            icon: "🌫️"
        },

        48: {
            description: "Rime Fog",
            icon: "🌫️"
        },

        51: {
            description: "Light Drizzle",
            icon: "🌦️"
        },

        53: {
            description: "Moderate Drizzle",
            icon: "🌦️"
        },

        55: {
            description: "Heavy Drizzle",
            icon: "🌧️"
        },

        61: {
            description: "Light Rain",
            icon: "🌦️"
        },

        63: {
            description: "Moderate Rain",
            icon: "🌧️"
        },

        65: {
            description: "Heavy Rain",
            icon: "🌧️"
        },

        71: {
            description: "Light Snow",
            icon: "🌨️"
        },

        73: {
            description: "Moderate Snow",
            icon: "❄️"
        },

        75: {
            description: "Heavy Snow",
            icon: "❄️"
        },

        80: {
            description: "Light Rain Showers",
            icon: "🌦️"
        },

        81: {
            description: "Moderate Rain Showers",
            icon: "🌧️"
        },

        82: {
            description: "Heavy Rain Showers",
            icon: "⛈️"
        },

        95: {
            description: "Thunderstorm",
            icon: "⛈️"
        },

        96: {
            description: "Thunderstorm with Hail",
            icon: "⛈️"
        },

        99: {
            description: "Thunderstorm with Heavy Hail",
            icon: "⛈️"
        }

    };


    // Return matching code

    return weatherCodes[code] || {

        description: "Unknown Weather",

        icon: "🌍"

    };

}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(dateTime) {

    /*
     * API returns something like:
     *
     * 2026-09-04T05:45
     *
     * We only need:
     *
     * 05:45 AM
     */

    const date =
        new Date(dateTime);


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// ========================================
// CURRENT LOCATION BUTTON
// ========================================

locationBtn.addEventListener(
    "click",
    getCurrentLocation
);


// ========================================
// GET CURRENT LOCATION
// ========================================

function getCurrentLocation() {

    clearError();

    /*
     * Check whether browser supports
     * geolocation.
     */

    if (!navigator.geolocation) {

        showError(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    showLoading();


    /*
     * Ask browser for user's location.
     */

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                /*
                 * We have coordinates.
                 * Now get weather.
                 */

                const locationName =
                    await getLocationName(
                        latitude,
                        longitude
                    );


                await getWeather(
                    latitude,
                    longitude,
                    locationName.name,
                    locationName.country
                );


            } catch (error) {

                showError(
                    "Unable to get weather for your location."
                );

            } finally {

                hideLoading();

            }

        },

        (error) => {

            hideLoading();


            /*
             * Handle location permission errors.
             */

            if (error.code === 1) {

                showError(
                    "Location permission was denied. Please allow location access."
                );

            } else if (error.code === 2) {

                showError(
                    "Your location could not be determined."
                );

            } else {

                showError(
                    "Unable to get your current location."
                );

            }

        }

    );

}


// ========================================
// GET CITY NAME FROM COORDINATES
// ========================================

async function getLocationName(
    latitude,
    longitude
) {

    /*
     * Reverse geocoding:
     *
     * Coordinates → City name
     */

    const url =
        `${GEOCODING_API}?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Unable to identify your location."
        );

    }


    const data =
        await response.json();


    if (
        !data.results ||
        data.results.length === 0
    ) {

        return {

            name: "Your Location",

            country: ""

        };

    }


    return {

        name: data.results[0].name,

        country: data.results[0].country

    };

}


// ========================================
// LOADING FUNCTIONS
// ========================================

function showLoading() {

    loading.classList.remove("hidden");

    weatherCard.classList.add("hidden");

    welcomeMessage.classList.add("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


// ========================================
// ERROR FUNCTIONS
// ========================================

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.remove("hidden");

}


function clearError() {

    errorMessage.textContent = "";

    errorMessage.classList.add("hidden");

}

