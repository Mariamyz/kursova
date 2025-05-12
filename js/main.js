const movies = [
    "Harry Potter and the Sorcerer's Stone",
    "Twilight",
    "Titanic",
    "Avatar",
    "The Lord of the Rings: The Fellowship of the Ring",
    "Pirates of the Caribbean: The Curse of the Black Pearl",
    "Fast & Furious",
    "Guardians of the Galaxy",
    "Joker",
    "The Dark Knight"
];

const showtimes = [
    "19:00", "19:30", "19:00", "18:45", "20:00", "20:15", "20:10", "19:10", "19:30", "19:45"
];

const dates = [
    { day: "П’ятниця", date: "06.06.2025" },
    { day: "Субота", date: "07.06.2025" },
    { day: "Неділя", date: "08.06.2025" },
    { day: "П’ятниця", date: "13.06.2025" },
    { day: "Субота", date: "14.06.2025" },
    { day: "Неділя", date: "15.06.2025" },
    { day: "П’ятниця", date: "20.06.2025" },
    { day: "Субота", date: "21.06.2025" },
    { day: "Неділя", date: "22.06.2025" },
    { day: "П’ятниця", date: "27.06.2025" }
];

const apiKey = '3ef9307e';
const apiKeyWeather = 'b77d0827e024c92619e1af299367b485';
const city = 'Rivne';
const unsplashAccessKey = "dEksPI42OjdG_XLZnNIVpymd7ukBJPeIx0p0VQb-Rzk";

const movieGrid = document.getElementById('movieGrid');

movies.forEach((title, index) => {
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.Poster && data.Poster !== "N/A") {
                const img = document.createElement('img');
                img.src = data.Poster;
                img.alt = data.Title;
                img.classList.add('movie-poster');
                img.onclick = () => showMovieInfo(data, showtimes[index], dates[index]);
                movieGrid.appendChild(img);
            }
        });
});

function showMovieInfo(data, showtime, dateInfo) {
    const infoWeatherContainer = document.createElement('div');
    infoWeatherContainer.className = 'info-weather';

    const movieCard = document.createElement('div');
    movieCard.id = 'movieCard';
    movieCard.className = 'card show';
    movieCard.innerHTML = `
    <img src="${data.Poster}" alt="${data.Title}">
    <div class="movie-content">
        <h2>${data.Title} (${data.Year})</h2>
        <p><strong>Жанр:</strong> ${data.Genre}</p>
        <p><strong>Режисер:</strong> ${data.Director}</p>
        <p><strong>Опис:</strong> ${data.Plot}</p>
        <p><strong>IMDb рейтинг:</strong> ${data.imdbRating}</p>
        <p><strong>Час показу:</strong> ${showtime}</p>
        <p><strong>День показу:</strong> ${dateInfo.day}, ${dateInfo.date}</p>
    </div>
`;

    const weatherCard = document.createElement('div');
    weatherCard.id = 'weatherCard';
    weatherCard.className = 'card';

    infoWeatherContainer.appendChild(movieCard);
    infoWeatherContainer.appendChild(weatherCard);

    const oldContainer = document.querySelector('.info-weather');
    if (oldContainer) oldContainer.remove();
    document.body.appendChild(infoWeatherContainer);

    getWeather(showtime);
}

function getWeather(showtime) {
    const hour = parseInt(showtime.split(":")[0]);

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ua&appid=${apiKeyWeather}`)
        .then(response => response.json())
        .then(data => {
            const forecast = data.list.find(item => {
                const forecastHour = new Date(item.dt_txt).getHours();
                return Math.abs(forecastHour - hour) <= 1;
            }) || data.list[0];

            let iconFile = "weather.svg";
            const description = forecast.weather[0].main.toLowerCase();

            if (description.includes("cloud")) {
                iconFile = "cloudy-day-2.svg";
            } else if (description.includes("rain")) {
                iconFile = "rainy-5.svg";
            } else if (description.includes("snow")) {
                iconFile = "snowy-3.svg";
            } else if (description.includes("thunder")) {
                iconFile = "thunder.svg";
            } else if (description.includes("clear") || description.includes("sun")) {
                iconFile = "day.svg";
            } else if (description.includes("night")) {
                iconFile = "night.svg";
            }

            const weatherCard = document.getElementById('weatherCard');
            weatherCard.innerHTML = `
                <h3>Погода в місті ${city} на час показу</h3>
                <img src="icons/${iconFile}" alt="Погода" class="weather-icon">
                <p>${forecast.weather[0].description}</p>
                <p><strong style="color: #ffa726;">Температура:</strong> <span style="color: #f5f5f5;">${forecast.main.temp}°C</span></p>
                <p><strong style="color: #ffa726;">Відчувається як:</strong> <span style="color:#f5f5f5;">${forecast.main.feels_like}°C</span></p>
            `;
            
        })
        .catch(error => {
            console.error("Помилка при отриманні погоди:", error);
            document.getElementById('weatherCard').innerHTML = `<p>Не вдалося завантажити погоду.</p>`;
        });
}

function toggleAbout() {
    const about = document.getElementById('aboutPopup');
    about.style.display = (about.style.display === 'block') ? 'none' : 'block';
}

function toggleMap() {
    const map = document.getElementById('mapPopup');
    map.style.display = (map.style.display === 'block') ? 'none' : 'block';
}


let map;

function initMap() {
    const parkShevchenka = { lat: 50.61555556, lng: 26.25888889 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: parkShevchenka,
    });

    new google.maps.Marker({
        position: parkShevchenka,
        map: map,
        title: "Парк Шевченка",
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        }
    });
}

function loadVisitorPhotos() {
    const query = "cinema outdoor ";
    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${unsplashAccessKey}`)
        .then(response => response.json())
        .then(data => {
            const galleryGrid = document.getElementById('visitorsGalleryGrid');
            galleryGrid.innerHTML = "";

            data.results.forEach(photo => {
                const img = document.createElement('img');
                img.src = photo.urls.small;
                img.alt = photo.alt_description || "Відвідувач";
                img.classList.add('visitor-photo');
                galleryGrid.appendChild(img);
            });
        })
        .catch(error => {
            console.error("Помилка завантаження фото:", error);
        });
}

loadVisitorPhotos();
