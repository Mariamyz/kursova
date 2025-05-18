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

const trailerLinks = {
  "Harry Potter and the Sorcerer's Stone": "https://www.youtube.com/embed/VyHV0BRtdxo",
  "Twilight": "https://www.youtube.com/embed/uxjNDE2fMjI",
  "Titanic": "https://www.youtube.com/embed/kVrqfYjkTdQ",
  "Avatar": "https://www.youtube.com/embed/5PSNL1qE6VY",
  "The Lord of the Rings: The Fellowship of the Ring": "https://www.youtube.com/embed/V75dMMIW2B4",
  "Pirates of the Caribbean: The Curse of the Black Pearl": "https://www.youtube.com/embed/naQr0uTrH_s",
  "Fast & Furious": "https://www.youtube.com/embed/uSDNZeRX_1Y",
  "Guardians of the Galaxy": "https://www.youtube.com/embed/d96cjJhvlMA",
  "Joker": "https://www.youtube.com/embed/zAGVQLHvwOY",
  "The Dark Knight": "https://www.youtube.com/embed/EXeTwQWrcwY"
};

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

    const trailerBtn = document.createElement('button');
    trailerBtn.textContent = "🎬 Дивитись трейлер";
    trailerBtn.className = "trailer-btn";
    trailerBtn.onclick = () => {
        const trailerUrl = trailerLinks[data.Title] || "https://www.youtube.com/embed/ScMzIvxBSi4";
        document.getElementById("trailerVideo").src = trailerUrl;
        openTrailer();
    };
    movieCard.appendChild(trailerBtn);

    const weatherCard = document.createElement('div');
    weatherCard.id = 'weatherCard';
    weatherCard.className = 'card';

    const oldContainer = document.querySelector('.info-weather');
    if (oldContainer) oldContainer.remove();

    const oldReviewSection = document.querySelector('.review-section');
    if (oldReviewSection) oldReviewSection.remove();

    const wrapper = document.createElement('div');
    wrapper.appendChild(infoWeatherContainer);

    infoWeatherContainer.appendChild(movieCard);
    infoWeatherContainer.appendChild(weatherCard);

    document.getElementById("movieGrid")?.after(wrapper);

    getWeather(showtime);

    const reviewSection = document.createElement('div');
    reviewSection.className = 'review-section';
    reviewSection.style.textAlign = 'left';
    reviewSection.style.marginLeft = '40px';
    reviewSection.style.marginRight = '40px';
    reviewSection.innerHTML = `
      <h3>💬 Залишити відгук</h3>
      <div class="star-rating">
        ${[1, 2, 3, 4, 5].map(i => `<span class="star" data-value="${i}">☆</span>`).join('')}
      </div>
      <input type="text" id="reviewerName" placeholder="Ваше ім’я">
      <textarea id="reviewText" placeholder="Ваш коментар..."></textarea>
      <button onclick="submitReview('${data.Title}')">Залишити відгук</button>
      <div id="reviewList"></div>
    `;

    wrapper.appendChild(reviewSection);

    reviewSection.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.value);
        reviewSection.querySelectorAll('.star').forEach(s => {
          s.textContent = parseInt(s.dataset.value) <= rating ? '★' : '☆';
          s.classList.remove('selected');
        });
        reviewSection.querySelectorAll('.star').forEach(s => {
          if (parseInt(s.dataset.value) <= rating) s.classList.add('selected');
        });
      });
    });

    renderReviews(data.Title, reviewSection.querySelector("#reviewList"));
}

function submitReview(title) {
  const reviewSection = document.querySelector(".review-section");
  const nameInput = reviewSection.querySelector("#reviewerName");
  const commentInput = reviewSection.querySelector("#reviewText");
  const name = nameInput.value.trim() || "Анонім";
  const comment = commentInput.value.trim();
  const selectedStars = reviewSection.querySelectorAll(".star.selected");
  const rating = selectedStars.length;

  if (!comment) return alert("Коментар не може бути порожнім!");

  const reviews = JSON.parse(localStorage.getItem("movieComments") || "{}");
  if (!reviews[title]) reviews[title] = [];
  reviews[title].push({ name, comment, rating });
  localStorage.setItem("movieComments", JSON.stringify(reviews));

  renderReviews(title, reviewSection.querySelector("#reviewList"));

  nameInput.value = "";
  commentInput.value = "";
  reviewSection.querySelectorAll(".star").forEach(s => {
    s.textContent = "☆";
    s.classList.remove("selected");
  });
}

function renderReviews(title, container) {
  const reviewsData = JSON.parse(localStorage.getItem("movieComments") || "{}");
  const reviews = reviewsData[title] || [];

  container.innerHTML = reviews.map((r, index) => `
    <div class="single-review">
      <div><strong>${r.name}</strong> — ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p>${r.comment}</p>
      <button onclick="deleteReview('${title}', ${index})">🗑️ Видалити</button>
    </div>
  `).join('');
}

function deleteReview(title, index) {
  const reviewsData = JSON.parse(localStorage.getItem("movieComments") || "{}");
  if (!reviewsData[title]) return;
  reviewsData[title].splice(index, 1);
  localStorage.setItem("movieComments", JSON.stringify(reviewsData));
  renderReviews(title, document.getElementById("reviewList"));
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

            if (description.includes("cloud")) iconFile = "cloudy-day-2.svg";
            else if (description.includes("rain")) iconFile = "rainy-5.svg";
            else if (description.includes("snow")) iconFile = "snowy-3.svg";
            else if (description.includes("thunder")) iconFile = "thunder.svg";
            else if (description.includes("clear") || description.includes("sun")) iconFile = "day.svg";
            else if (description.includes("night")) iconFile = "night.svg";

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
    const map = document.getElementById("mapPopup");
    map.style.display = (map.style.display === "block") ? "none" : "block";
}

function closeTrailer() {
    const modal = document.getElementById("trailerModal");
    modal.style.display = "none";
    const iframe = document.getElementById("trailerVideo");
    iframe.src = iframe.src;
}


function showFallbackImage() {
    document.getElementById('map').style.display = 'none';
    document.getElementById('fallbackImage').style.display = 'block';
}



function loadVisitorPhotos() {
    const query = "cinema outdoor ";
    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${unsplashAccessKey}`)
        .then(response => response.json())
        .then(data => {
            const galleryGrid = document.getElementById('visitorsGalleryGrid');
            if (!galleryGrid.innerHTML.includes("img")) {
                galleryGrid.innerHTML = "";
            }
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


function loadLocalVisitorPhotos() {
    const galleryGrid = document.getElementById('visitorsGalleryGrid');

    const localImages = [
        "img/зображення_viber_2025-05-13_17-13-06-494.jpg",
        "img/зображення_viber_2025-05-13_17-13-08-598.jpg",
        "img/зображення_viber_2025-05-13_17-13-16-662.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-352.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-391.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-437.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-466.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-508.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-543.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-592.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-630.jpg",
        "img/зображення_viber_2025-05-13_17-14-24-683.jpg"
    ];

    localImages.forEach(path => {
        const img = document.createElement('img');
        img.src = path;
        img.alt = "Наш відвідувач";
        img.classList.add('visitor-photo');
        galleryGrid.appendChild(img);
    });
}

loadLocalVisitorPhotos();
loadVisitorPhotos();

function openTrailer() {
  document.getElementById("trailerModal").style.display = "block";
}

function closeTrailer() {
  const modal = document.getElementById("trailerModal");
  modal.style.display = "none";

  const iframe = document.getElementById("trailerVideo");
  iframe.src = iframe.src; 
}
function renderAllReviews() {
    const reviews = JSON.parse(localStorage.getItem("movieReviews")) || {};
    const container = document.getElementById("reviewsGalleryGrid");
    container.innerHTML = "";
  
    Object.entries(reviews).forEach(([title, { text, rating }]) => {
      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <h3>${title}</h3>
        <div class="review-stars">${"★".repeat(rating || 0)}${"☆".repeat(5 - (rating || 0))}</div>
        <p>${text || "Без коментаря."}</p>
      `;
      container.appendChild(card);
    });
  }
  