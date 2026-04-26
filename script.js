// Data Movies & Cinemas
const moviesData = [
    {
        id: 1,
        title: "Avengers: Endgame",
        genre: "Action, Sci-Fi",
        poster: "https://images.unsplash.com/photo-1489599091528-f4b0a5a929a9?w=1200&h=600&fit=crop",
        rating: 8.4,
        duration: "181 menit",
        cinemas: {
            jakarta: [
                { id: "cgv-pgx", name: "CGV Pacific Place", showtimes: ["13:00", "16:30", "20:00", "22:30"] },
                { id: "xxi-senayan", name: "XXI Senayan City", showtimes: ["12:30", "15:45", "19:30", "22:00"] }
            ],
            bandung: [
                { id: "cgv-paris", name: "CGV Paris Van Java", showtimes: ["14:00", "17:15", "20:45"] }
            ]
        }
    },
    {
        id: 2,
        title: "Spider-Man: No Way Home",
        genre: "Action, Adventure",
        poster: "https://images.unsplash.com/photo-1578632344414-57106a254b2e?w=1200&h=600&fit=crop",
        rating: 8.2,
        duration: "148 menit",
        cinemas: {
            jakarta: [
                { id: "cgv-pgx2", name: "CGV Pacific Place", showtimes: ["13:30", "16:00", "19:45", "22:15"] },
                { id: "xxi-senayan2", name: "XXI Senayan City", showtimes: ["12:45", "16:15", "20:00"] }
            ],
            bandung: [
                { id: "cgv-paris2", name: "CGV Paris Van Java", showtimes: ["13:45", "17:00", "20:30"] }
            ]
        }
    },
    {
        id: 3,
        title: "Dune",
        genre: "Sci-Fi, Adventure",
        poster: "https://images.unsplash.com/photo-1489599091528-f4b0a5a929a9?w=400&h=600&fit=crop",
        rating: 8.0,
        duration: "155 menit",
        cinemas: {
            jakarta: [
                { id: "cgv-pgx3", name: "CGV Pacific Place", showtimes: ["14:30", "18:00", "21:00"] }
            ],
            surabaya: [
                { id: "xxi-tunjungan", name: "XXI Tunjungan Plaza", showtimes: ["13:15", "16:45", "20:15"] }
            ]
        }
    }
];

const appState = {
    currentLocation: 'jakarta',
    currentDate: new Date(),
    selectedMovie: null,
    selectedCinema: null,
    selectedShowtime: null,
    selectedSeats: [],
    ticketPrice: 50000,
    userName: 'Guest'
};

// DOM Elements
const elements = {
    moviesGrid: document.getElementById('moviesGrid'),
    bookingModal: document.getElementById('bookingModal'),
    successModal: document.getElementById('successModal'),
    locationItems: document.querySelectorAll('.location-item'),
    prevDate: document.getElementById('prevDate'),
    nextDate: document.getElementById('nextDate'),
    currentDate: document.getElementById('currentDate'),
    userName: document.getElementById('userName'),
    
    // Modal elements
    movieTitleModal: document.getElementById('movieTitleModal'),
    cinemaOptions: document.getElementById('cinemaOptions'),
    showtimes: document.getElementById('showtimes'),
    seatsContainer: document.getElementById('seatsContainer'),
    ticketCount: document.getElementById('ticketCount'),
    totalPrice: document.getElementById('totalPrice'),
    showtimeTitle: document.getElementById('showtimeTitle'),
    
    // Buttons
    closeModal: document.getElementById('closeModal'),
    backToMovies: document.getElementById('backToMovies'),
    confirmBooking: document.getElementById('confirmBooking'),
    newBooking: document.getElementById('newBooking')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    renderMovies();
    setupEventListeners();
    updateDateDisplay();
    loadUserPreference();
}

function setupEventListeners() {
    // Location switch
    elements.locationItems.forEach(item => {
        item.addEventListener('click', () => switchLocation(item.dataset.location));
    });

    // Date navigation
    elements.prevDate.addEventListener('click', () => changeDate(-1));
    elements.nextDate.addEventListener('click', () => changeDate(1));

    // Modal controls
    elements.closeModal.addEventListener('click', closeModal);
    elements.backToMovies.addEventListener('click', closeModal);
    elements.confirmBooking.addEventListener('click', confirmBooking);
    elements.newBooking.addEventListener('click', () => {
        elements.successModal.style.display = 'none';
        closeModal();
    });

    // Close modal on outside click
    elements.bookingModal.addEventListener('click', (e) => {
        if (e.target === elements.bookingModal) closeModal();
    });

    // Prevent body scroll when modal open
    elements.bookingModal.addEventListener('transitionend', toggleBodyScroll);
}

function switchLocation(location) {
    appState.currentLocation = location;
    elements.locationItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-location="${location}"]`).classList.add('active');
    renderMovies();
    saveUserPreference();
}

function changeDate(days) {
    appState.currentDate.setDate(appState.currentDate.getDate() + days);
    updateDateDisplay();
    renderMovies();
}

function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.currentDate.textContent = `Hari Ini, ${appState.currentDate.toLocaleDateString('id-ID', options)}`;
}

function renderMovies() {
    elements.moviesGrid.innerHTML = '';
    
    moviesData.forEach(movie => {
        if (movie.cinemas[appState.currentLocation]) {
            const movieCard = createMovieCard(movie);
            elements.moviesGrid.appendChild(movieCard);
        }
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.dataset.movieId = movie.id;
    card.innerHTML = `
        <div class="movie-poster">
            <div class="movie-rating">${movie.rating}</div>
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster-img">
            <div class="movie-overlay">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-genre">${movie.genre} • ${movie.duration}</div>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openBookingModal(movie));
    return card;
}

function openBookingModal(movie) {
    appState.selectedMovie = movie;
    elements.movieTitleModal.textContent = movie.title;
    elements.bookingModal.style.display = 'flex';
    renderCinemaOptions();
}

function renderCinemaOptions() {
    const cinemas = appState.selectedMovie.cinemas[appState.currentLocation];
    elements.cinemaOptions.innerHTML = '';
    
    cinemas.forEach((cinema, index) => {
        const cinemaBtn = document.createElement('div');
        cinemaBtn.className = index === 0 ? 'cinema-option active' : 'cinema-option';
        cinemaBtn.dataset.cinemaId = cinema.id;
        cinemaBtn.innerHTML = `<i class="fas fa-building"></i> ${cinema.name}`;
        cinemaBtn.addEventListener('click', () => selectCinema(cinemaBtn.dataset.cinemaId));
        elements.cinemaOptions.appendChild(cinemaBtn);
    });
    
    // Select first cinema by default
    selectCinema(cinemas[0].id);
}

function selectCinema(cinemaId) {
    appState.selectedCinema = cinemaId;
    document.querySelectorAll('.cinema-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cinemaId === cinemaId);
    });
    
    const cinema = appState.selectedMovie.cinemas[appState.currentLocation]
        .find(c => c.id === cinemaId);
    renderShowtimes(cinema.showtimes);
}

function renderShowtimes(showtimes) {
    elements.showtimes.innerHTML = '';
    elements.showtimeTitle.textContent = `Jadwal Tayang - ${appState.selectedCinema?.toUpperCase()}`;
    
    showtimes.forEach((time, index) => {
        const timeBtn = document.createElement('button');
        timeBtn.className = index === 0 ? 'showtime-btn active' : 'showtime-btn';
        timeBtn.dataset.showtime = time;
        timeBtn.textContent = time;
        timeBtn.addEventListener('click', () => selectShowtime(time));
        elements.showtimes.appendChild(timeBtn);
    });
    
    // Select first showtime by default
    selectShowtime(showtimes[0]);
}

function selectShowtime(showtime) {
    appState.selectedShowtime = showtime;
    document.querySelectorAll('.showtime-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.showtime === showtime);
    });
    renderSeats();
}

function renderSeats() {
    // Generate 5 rows x 10 seats
    const totalSeats = 50;
    const seatsContainer = elements.seatsContainer;
    seatsContainer.innerHTML = '';
    
    for (let row = 1; row <= 5; row++) {
        const seatRow = document.createElement('div');
        seatRow.className = 'seat-row';
        
        for (let seat = 1; seat <= 10; seat++) {
            const seatNum = (row - 1) * 10 + seat;
            const seatEl = document.createElement('div');
            seatEl.className = 'seat available';
            seatEl.dataset.seatId = seatNum;
            seatEl.textContent = String(seatNum).padStart(2, '0');
            seatEl.addEventListener('click', () => toggleSeat(seatEl));
            seatRow.appendChild(seatEl);
        }
        seatsContainer.appendChild(seatRow);
    }
    
    updateSummary();
}

function toggleSeat(seatEl) {
    const seatId = parseInt(seatEl.dataset.seatId);
    
    if (seatEl.classList.contains('booked')) return;
    
    if (seatEl.classList.contains('selected')) {
        seatEl.classList.remove('selected');
        appState.selectedSeats = appState.selectedSeats.filter(id => id !== seatId);
    } else {
        if (appState.selectedSeats.length < 8) { // Max 8 seats
            seatEl.classList.add('selected');
            appState.selectedSeats.push(seatId);
        } else {
            showNotification('Maksimal 8 tiket per transaksi');
        }
    }
    
    // Randomly book some seats
    if (Math.random() < 0.3) {
        const availableSeats = document.querySelectorAll('.seat.available:not(.selected)');
        if (availableSeats.length > 0) {
            const randomSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
            randomSeat.classList.remove('available');
            randomSeat.classList.add('booked');
        }
    }
    
    updateSummary();
}

function updateSummary() {
    const count = appState.selectedSeats.length;
    elements.ticketCount.textContent = count;
    elements.totalPrice.textContent = `Rp ${formatCurrency(count * appState.ticketPrice)}`;
    
    // Enable/disable confirm button
    elements.confirmBooking.disabled = count === 0;
    elements.confirmBooking.style.opacity = count === 0 ? '0.5' : '1';
}

function confirmBooking() {
    if (appState.selectedSeats.length === 0) return;
    
    // Simulate payment processing
    elements.confirmBooking.textContent = 'Memproses...';
    elements.confirmBooking.disabled = true;
    
    setTimeout(() => {
        elements.bookingModal.style.display = 'none';
        elements.successModal.style.display = 'flex';
        resetBookingState();
        elements.confirmBooking.textContent = 'Lanjut Bayar';
        elements.confirmBooking.disabled = false;
    }, 2000);
}

function resetBookingState() {
    appState.selectedMovie = null;
    appState.selectedCinema = null;
    appState.selectedShowtime = null;
    appState.selectedSeats = [];
}

function closeModal() {
    elements.bookingModal.style.display = 'none';
    resetBookingState();
}

function toggleBodyScroll() {
    document.body.style.overflow = elements.bookingModal.style.display === 'flex' ? 'hidden' : '';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message) {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// User Preferences (LocalStorage)
function saveUserPreference() {
    localStorage.setItem('cinemaApp', JSON.stringify({
        currentLocation: appState.currentLocation,
        userName: appState.userName
    }));
}

function loadUserPreference() {
    const saved = localStorage.getItem('cinemaApp');
    if (saved) {
        const prefs = JSON.parse(saved);
        appState.currentLocation = prefs.currentLocation || 'jakarta';
        appState.userName = prefs.userName || 'Guest';
        
        // Update UI
        document.querySelector(`[data-location="${appState.currentLocation}"]`).classList.add('active');
        elements.userName.textContent = appState.userName;
        
        renderMovies();
    }
}

// Add CSS for toast (inline)
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(toastStyle);

// PWA Ready - Service Worker (Optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
