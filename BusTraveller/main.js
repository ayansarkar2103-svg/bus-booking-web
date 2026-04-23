const fullName = localStorage.getItem("name");
const email = localStorage.getItem("user");

const userNameEl = document.getElementById("user-name");
const avatarEl = document.getElementById("avatar");
const welcomeTextEl = document.getElementById("welcomeText");

if (fullName && userNameEl && avatarEl) {
  userNameEl.innerText = fullName;
  const firstName = fullName.split(" ")[0];
  avatarEl.innerText = firstName.charAt(0).toUpperCase();

  if (welcomeTextEl) {
    welcomeTextEl.innerText = `Welcome to Bus Booking, ${firstName}!`;
  }
} else if (email && userNameEl && avatarEl) {
  userNameEl.innerText = email;
  avatarEl.innerText = email.charAt(0).toUpperCase();

  if (welcomeTextEl) {
    welcomeTextEl.innerText = "Welcome to Bus Booking!";
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("name");
  localStorage.removeItem("confirmedBooking");
  localStorage.removeItem("ticketId");
  window.location.href = "login.html";
}

function goToTrip() {
  window.location.href = "trip.html";
}

function goToBookings() {
  window.location.href = "my-bookings.html";
}

window.logout = logout;
window.goToTrip = goToTrip;
window.goToBookings = goToBookings;

const indianPlaces = [
  "Agra", "Ahmedabad", "Ajmer", "Aligarh", "Allahabad", "Alwar", "Ambala", "Amritsar",
  "Asansol", "Aurangabad", "Ayodhya", "Badarpur", "Bagdogra", "Balasore", "Ballia",
  "Bally", "Banda", "Bangalore", "Bankura", "Bareilly", "Barrackpore", "Barasat",
  "Bardhaman", "Belgaum", "Berhampore", "Berhampur", "Bhagalpur", "Bharatpur",
  "Bharuch", "Bhatinda", "Bhilai", "Bhilwara", "Bhiwandi", "Bhopal", "Bhubaneswar",
  "Bhuj", "Bidhannagar", "Bijapur", "Bikaner", "Bilaspur", "Bokaro", "Bolpur",
  "Bongaigaon", "Burdwan", "Calicut", "Chandannagar", "Chandigarh", "Chennai",
  "Chhapra", "Chhindwara", "Chinsurah", "Coimbatore", "Cooch Behar", "Cuttack",
  "Darbhanga", "Darjeeling", "Dehradun", "Dehri", "Delhi", "Dewas", "Dhanbad",
  "Dharmavaram", "Dharwad", "Digha", "Dibrugarh", "Dimapur", "Dindigul", "Durg",
  "Durgapur", "Eluru", "Erode", "Etawah", "Faizabad", "Faridabad", "Firozabad",
  "Gandhidham", "Gandhinagar", "Gangtok", "Gaya", "Ghaziabad", "Ghazipur", "Goa",
  "Gonda", "Gorakhpur", "Greater Noida", "Gulbarga", "Guntur", "Gurgaon", "Guwahati",
  "Gwalior", "Habra", "Haldia", "Haldwani", "Haridwar", "Hazaribagh", "Hinganghat",
  "Hisar", "Hoshiarpur", "Howrah", "Hubli", "Hyderabad", "Imphal", "Indore", "Jabalpur",
  "Jaipur", "Jalandhar", "Jalgaon", "Jalna", "Jalpaiguri", "Jammu", "Jamnagar",
  "Jamshedpur", "Jaunpur", "Jhansi", "Jodhpur", "Junagadh", "Kakinada", "Kalyani",
  "Kanchrapara", "Kannur", "Kanpur", "Karimganj", "Karnal", "Karur", "Katihar",
  "Kharagpur", "Kochi", "Kolhapur", "Kolkata", "Kollam", "Korba", "Kota", "Kottayam",
  "Kozhikode", "Krishnanagar", "Kulti", "Kullu", "Kurnool", "Kurukshetra", "Latur",
  "Lucknow", "Ludhiana", "Madurai", "Maheshtala", "Malda", "Manali", "Mangalore",
  "Mathura", "Meerut", "Midnapore", "Mirzapur", "Moradabad", "Motihari", "Mumbai",
  "Muzaffarnagar", "Muzaffarpur", "Mysore", "Nabadwip", "Nadiad", "Nagaon", "Nagpur",
  "Naihati", "Nanded", "Nandyal", "Nashik", "Navsari", "Nellore", "New Delhi",
  "Noida", "North Lakhimpur", "Ongole", "Palakkad", "Panihati", "Panipat", "Patiala",
  "Patna", "Pondicherry", "Port Blair", "Pune", "Puri", "Purulia", "Raebareli",
  "Raichur", "Raiganj", "Raipur", "Rajahmundry", "Rajkot", "Ramagundam", "Ranchi",
  "Raniganj", "Ratlam", "Raurkela", "Rewa", "Rishikesh", "Rohtak", "Roorkee", "Sagar",
  "Saharanpur", "Salem", "Sambalpur", "Sangli", "Satna", "Secunderabad", "Serampore",
  "Shahjahanpur", "Shillong", "Shimla", "Shivamogga", "Siliguri", "Silchar", "Sindri",
  "Siwan", "Solapur", "Sonipat", "Sri Ganganagar", "Srinagar", "Sultanpur", "Surat",
  "Suri", "Thane", "Thanjavur", "Thrissur", "Tinsukia", "Tiruchirappalli", "Tirunelveli",
  "Tirupati", "Tumkur", "Udaipur", "Udupi", "Ujjain", "Uluberia", "Vadodara", "Valsad",
  "Varanasi", "Vasai", "Vellore", "Vijayawada", "Visakhapatnam", "Warangal"
];

function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestionsBox = document.getElementById(suggestionsId);

  if (!input || !suggestionsBox) return;

  input.addEventListener("input", function () {
    const value = this.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (!value) {
      suggestionsBox.style.display = "none";
      return;
    }

    const filtered = indianPlaces
      .filter((place) => place.toLowerCase().includes(value))
      .slice(0, 12);

    if (filtered.length === 0) {
      suggestionsBox.style.display = "none";
      return;
    }

    filtered.forEach((place) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = place;

      item.addEventListener("click", function () {
        input.value = place;
        suggestionsBox.style.display = "none";
      });

      suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = "block";
  });

  input.addEventListener("focus", function () {
    if (this.value.trim()) {
      this.dispatchEvent(new Event("input"));
    }
  });

  document.addEventListener("click", function (e) {
    if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = "none";
    }
  });
}

function swapCities() {
  const fromInput = document.getElementById("from");
  const toInput = document.getElementById("to");

  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;
}

function searchBuses() {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const date = document.getElementById("journeyDate").value;

  if (!from || !to || !date) {
    alert("Please enter From, To and Date.");
    return;
  }

  localStorage.setItem("selectedFrom", from);
  localStorage.setItem("selectedTo", to);
  localStorage.setItem("selectedDate", date);

  window.location.href = "trip.html";
}

function selectRoute(from, to) {
  localStorage.setItem("selectedFrom", from);
  localStorage.setItem("selectedTo", to);

  const existingDate = localStorage.getItem("selectedDate");
  if (!existingDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    localStorage.setItem("selectedDate", `${yyyy}-${mm}-${dd}`);
  }

  window.location.href = "trip.html";
}

window.swapCities = swapCities;
window.searchBuses = searchBuses;
window.selectRoute = selectRoute;

setupAutocomplete("from", "fromSuggestions");
setupAutocomplete("to", "toSuggestions");