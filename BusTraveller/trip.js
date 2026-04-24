const container = document.getElementById("seatContainer");
const sleeperContainer = document.getElementById("sleeperContainer");

const selectedSeatsText = document.getElementById("selectedSeats");
const totalPriceText = document.getElementById("totalPrice");
const routeText = document.getElementById("routeText");
const dateText = document.getElementById("dateText");
const seatPills = document.getElementById("seatPills");

const boardingSummary = document.getElementById("boardingSummary");
const droppingSummary = document.getElementById("droppingSummary");
const passengerSummary = document.getElementById("passengerSummary");
const seatTypeSummary = document.getElementById("seatTypeSummary");
const operatorSummary = document.getElementById("operatorSummary");
const departureSummary = document.getElementById("departureSummary");
const arrivalSummary = document.getElementById("arrivalSummary");
const durationSummary = document.getElementById("durationSummary");

const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const dateInput = document.getElementById("date");
const boardingInput = document.getElementById("boardingPoint");
const droppingInput = document.getElementById("droppingPoint");
const passengerNameInput = document.getElementById("passengerName");
const passengerAgeInput = document.getElementById("passengerAge");
const passengerGenderInput = document.getElementById("passengerGender");
const phoneInput = document.getElementById("phone");

const departureTimeEl = document.getElementById("departureTime");
const arrivalTimeEl = document.getElementById("arrivalTime");
const durationTimeEl = document.getElementById("durationTime");

const seaterPriceEl = document.getElementById("seaterPrice");
const sleeperPriceEl = document.getElementById("sleeperPrice");

const operatorTitle = document.getElementById("operatorTitle");
const busTypeText = document.getElementById("busTypeText");

const payBtn =
  document.getElementById("payBtn") ||
  document.getElementById("bookBtn") ||
  document.getElementById("bookNowBtn");

const SEATER_PRICE = 500;
const SLEEPER_PRICE = 900;
const DEFAULT_OPERATOR = "Laxmi Holidays Express";
const DEFAULT_BUS_TYPE = "Seater + Sleeper • Premium AC";
const API_BASE = "https://bus-booking-web-app-production.up.railway.app";

if (seaterPriceEl) seaterPriceEl.innerText = SEATER_PRICE;
if (sleeperPriceEl) sleeperPriceEl.innerText = SLEEPER_PRICE;

let selectedSeats = [];
let bookedSeatSet = new Set();
let isPaymentInProgress = false;

const routeBusData = {
  "Chandigarh|Manali": {
    operator: "Rock Sissu",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "10:30 PM",
    defaultArrival: "06:00 AM",
    boardingStops: [
      { name: "Sector 17 ISBT", time: "09:45 PM" },
      { name: "Sector 43 Bus Stand", time: "10:00 PM" },
      { name: "Zirakpur Bus Stop", time: "10:20 PM" }
    ],
    droppingStops: [
      { name: "Private Bus Stand Manali", time: "05:30 AM" },
      { name: "Mall Road Bus Stop", time: "05:45 AM" },
      { name: "Hadimba Road Point", time: "06:00 AM" }
    ]
  },

  "Manali|Chandigarh": {
    operator: "Rock Sissu",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "07:00 PM",
    defaultArrival: "02:30 AM",
    boardingStops: [
      { name: "Private Bus Stand Manali", time: "07:00 PM" },
      { name: "Mall Road Bus Stop", time: "07:15 PM" },
      { name: "Hadimba Road Point", time: "07:30 PM" }
    ],
    droppingStops: [
      { name: "Zirakpur Bus Stop", time: "02:00 AM" },
      { name: "Sector 43 Bus Stand", time: "02:15 AM" },
      { name: "Sector 17 ISBT", time: "02:30 AM" }
    ]
  },

  "Chandigarh|New Delhi": {
    operator: "Laxmi Holidays Express",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "10:30 PM",
    defaultArrival: "03:30 AM",
    boardingStops: [
      { name: "Sector 17 ISBT", time: "10:00 PM" },
      { name: "Sector 43 Bus Stand", time: "10:15 PM" },
      { name: "Zirakpur Bus Stop", time: "10:30 PM" }
    ],
    droppingStops: [
      { name: "Kashmere Gate ISBT", time: "03:00 AM" },
      { name: "Majnu Ka Tila", time: "03:15 AM" },
      { name: "Anand Vihar ISBT", time: "03:30 AM" }
    ]
  },

  "New Delhi|Chandigarh": {
    operator: "Laxmi Holidays Express",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "08:30 PM",
    defaultArrival: "01:30 AM",
    boardingStops: [
      { name: "Kashmere Gate ISBT", time: "08:30 PM" },
      { name: "Majnu Ka Tila", time: "08:45 PM" },
      { name: "Anand Vihar ISBT", time: "09:00 PM" }
    ],
    droppingStops: [
      { name: "Zirakpur Bus Stop", time: "01:00 AM" },
      { name: "Sector 43 Bus Stand", time: "01:15 AM" },
      { name: "Sector 17 ISBT", time: "01:30 AM" }
    ]
  },

  "Kolkata|Digha": {
    operator: "Laxmi Holidays",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "09:30 PM",
    defaultArrival: "05:30 AM",
    boardingStops: [
      { name: "Esplanade Bus Terminus", time: "09:30 PM" },
      { name: "Howrah Bus Depot", time: "09:50 PM" },
      { name: "Karunamoyee Bus Stand", time: "10:10 PM" }
    ],
    droppingStops: [
      { name: "Old Digha Bus Stand", time: "05:30 AM" },
      { name: "New Digha Bus Stand", time: "05:45 AM" },
      { name: "Digha Railway Gate Stop", time: "06:00 AM" }
    ]
  },

  "Digha|Kolkata": {
    operator: "Laxmi Holidays",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "08:30 PM",
    defaultArrival: "04:30 AM",
    boardingStops: [
      { name: "Old Digha Bus Stand", time: "08:30 PM" },
      { name: "New Digha Bus Stand", time: "08:45 PM" },
      { name: "Digha Railway Gate Stop", time: "09:00 PM" }
    ],
    droppingStops: [
      { name: "Karunamoyee Bus Stand", time: "04:00 AM" },
      { name: "Howrah Bus Depot", time: "04:15 AM" },
      { name: "Esplanade Bus Terminus", time: "04:30 AM" }
    ]
  },

  "Agra|Jaipur": {
    operator: "Royal Rajasthan",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "08:15 AM",
    defaultArrival: "01:30 PM",
    boardingStops: [
      { name: "Idgah Bus Stand", time: "08:30 AM" },
      { name: "Agra Fort Bus Stop", time: "08:45 AM" },
      { name: "ISBT Agra", time: "08:00 AM" }
    ],
    droppingStops: [
      { name: "Sindhi Camp Bus Stand", time: "01:00 PM" },
      { name: "Narayan Singh Circle", time: "01:15 PM" },
      { name: "Jaipur Railway Station Stop", time: "01:30 PM" }
    ]
  },

  "Jaipur|Agra": {
    operator: "Royal Rajasthan",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "06:00 AM",
    defaultArrival: "11:00 AM",
    boardingStops: [
      { name: "Sindhi Camp Bus Stand", time: "06:00 AM" },
      { name: "Narayan Singh Circle", time: "06:15 AM" },
      { name: "Jaipur Railway Station Stop", time: "06:30 AM" }
    ],
    droppingStops: [
      { name: "ISBT Agra", time: "11:00 AM" },
      { name: "Agra Fort Bus Stop", time: "10:45 AM" },
      { name: "Idgah Bus Stand", time: "10:50 AM" }
    ]
  },

  "Dehradun|New Delhi": {
    operator: "Doon Dehri",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "05:25 PM",
    defaultArrival: "11:00 PM",
    boardingStops: [
      { name: "ISBT Dehradun", time: "05:25 PM" },
      { name: "Clock Tower Bus Stop", time: "05:35 PM" },
      { name: "Prince Chowk", time: "04:45 PM" }
    ],
    droppingStops: [
      { name: "Kashmere Gate ISBT", time: "11:30 PM" },
      { name: "Majnu Ka Tila", time: "11:20 PM" },
      { name: "Anand Vihar ISBT", time: "11:00 PM" }
    ]
  },

  "New Delhi|Dehradun": {
    operator: "Doon Dehri",
    busType: "Seater + Sleeper • Premium AC",
    defaultDeparture: "05:00 PM",
    defaultArrival: "11:15 PM",
    boardingStops: [
      { name: "Kashmere Gate ISBT", time: "05:00 PM" },
      { name: "Majnu Ka Tila", time: "05:15 PM" },
      { name: "Anand Vihar ISBT", time: "05:25 PM" }
    ],
    droppingStops: [
      { name: "Prince Chowk", time: "11:00 PM" },
      { name: "Clock Tower Bus Stop", time: "10:50 PM" },
      { name: "ISBT Dehradun", time: "11:15 PM" }
    ]
  }
};

let busInfo = {
  operator: DEFAULT_OPERATOR,
  busType: DEFAULT_BUS_TYPE,
  departure: "N/A",
  arrival: "N/A",
  duration: "N/A"
};

function setButtonLoading(isLoading) {
  if (!payBtn) return;
  payBtn.disabled = isLoading;
  payBtn.innerText = isLoading ? "Processing..." : "Proceed to Pay";
}

function getRouteKey() {
  return `${fromInput.value.trim()}|${toInput.value.trim()}`;
}

function getCurrentRouteData() {
  return routeBusData[getRouteKey()] || null;
}

function populateStops(selectElement, stops, defaultLabel) {
  if (!selectElement) return;

  selectElement.innerHTML = `<option value="">${defaultLabel}</option>`;

  if (!stops || stops.length === 0) return;

  stops.forEach((stop) => {
    const option = document.createElement("option");
    option.value = `${stop.name} - ${stop.time}`;
    option.textContent = `${stop.name} - ${stop.time}`;
    selectElement.appendChild(option);
  });
}

function updateBoardingDroppingPoints() {
  const routeData = getCurrentRouteData();
  const oldBoarding = boardingInput?.value || "";
  const oldDropping = droppingInput?.value || "";

  if (routeData) {
    populateStops(boardingInput, routeData.boardingStops, "Select Boarding Point");
    populateStops(droppingInput, routeData.droppingStops, "Select Dropping Point");
  } else {
    if (boardingInput) boardingInput.innerHTML = `<option value="">Select Boarding Point</option>`;
    if (droppingInput) droppingInput.innerHTML = `<option value="">Select Dropping Point</option>`;
  }

  const boardingStillExists = boardingInput
    ? Array.from(boardingInput.options).some((option) => option.value === oldBoarding)
    : false;

  const droppingStillExists = droppingInput
    ? Array.from(droppingInput.options).some((option) => option.value === oldDropping)
    : false;

  if (boardingInput) boardingInput.value = boardingStillExists ? oldBoarding : "";
  if (droppingInput) droppingInput.value = droppingStillExists ? oldDropping : "";

  updateBusInfo();
  updateFormSummary();
}

function convertTimeToMinutes(timeStr) {
  if (!timeStr) return null;

  const parts = timeStr.trim().split(" ");
  if (parts.length !== 2) return null;

  const [time, modifier] = parts;
  let [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function formatDuration(startTime, endTime) {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) return "N/A";

  let diff = endMinutes - startMinutes;
  if (diff < 0) diff += 24 * 60;

  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  return `${hrs}h ${String(mins).padStart(2, "0")}m`;
}

function updateBusInfo() {
  const routeData = getCurrentRouteData();

  if (!routeData) {
    busInfo = {
      operator: DEFAULT_OPERATOR,
      busType: DEFAULT_BUS_TYPE,
      departure: "N/A",
      arrival: "N/A",
      duration: "N/A"
    };
  } else {
    const selectedBoarding = boardingInput?.value || "";
    const selectedDropping = droppingInput?.value || "";

    let departureTime = routeData.defaultDeparture;
    let arrivalTime = routeData.defaultArrival;

    if (selectedBoarding) {
      const boardingMatch = routeData.boardingStops.find(
        (stop) => `${stop.name} - ${stop.time}` === selectedBoarding
      );
      if (boardingMatch) departureTime = boardingMatch.time;
    }

    if (selectedDropping) {
      const droppingMatch = routeData.droppingStops.find(
        (stop) => `${stop.name} - ${stop.time}` === selectedDropping
      );
      if (droppingMatch) arrivalTime = droppingMatch.time;
    }

    busInfo = {
      operator: routeData.operator,
      busType: routeData.busType,
      departure: departureTime,
      arrival: arrivalTime,
      duration: formatDuration(departureTime, arrivalTime)
    };
  }

  if (operatorTitle) operatorTitle.innerText = busInfo.operator;
  if (busTypeText) busTypeText.innerText = busInfo.busType;
  if (departureTimeEl) departureTimeEl.innerText = busInfo.departure;
  if (arrivalTimeEl) arrivalTimeEl.innerText = busInfo.arrival;
  if (durationTimeEl) durationTimeEl.innerText = busInfo.duration;
  if (departureSummary) departureSummary.innerText = busInfo.departure;
  if (arrivalSummary) arrivalSummary.innerText = busInfo.arrival;
  if (operatorSummary) operatorSummary.innerText = busInfo.operator;
  if (durationSummary) durationSummary.innerText = busInfo.duration;
}

function swapCities() {
  const temp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = temp;

  updateRouteUI();
  updateBoardingDroppingPoints();
  loadBookedSeats();
}

window.swapCities = swapCities;

function getSeatPrice(seatNo) {
  return seatNo.startsWith("S") ? SLEEPER_PRICE : SEATER_PRICE;
}

function getSeatTypeLabel() {
  if (selectedSeats.length === 0) return "None";

  const hasSeater = selectedSeats.some((seat) => !seat.startsWith("S"));
  const hasSleeper = selectedSeats.some((seat) => seat.startsWith("S"));

  if (hasSeater && hasSleeper) return "Seater + Sleeper";
  if (hasSleeper) return "Sleeper";
  return "Seater";
}

function createSeaterSeats() {
  if (!container) return;

  container.innerHTML = "";
  let seatNumber = 1;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      if (col === 2) {
        const aisle = document.createElement("div");
        aisle.classList.add("aisle");
        container.appendChild(aisle);
        continue;
      }

      const seatNo = String(seatNumber++);
      const seat = document.createElement("div");
      seat.className = "seat";
      seat.innerText = seatNo;

      if (bookedSeatSet.has(seatNo)) {
        seat.classList.add("booked");
      } else {
        seat.addEventListener("click", () => toggleSeat(seatNo, seat));
      }

      if (selectedSeats.includes(seatNo)) {
        seat.classList.add("selected");
      }

      container.appendChild(seat);
    }
  }
}

function createSleeperSeats() {
  if (!sleeperContainer) return;

  sleeperContainer.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const seatNo = "S" + i;
    const sleeper = document.createElement("div");
    sleeper.className = "sleeper-seat";
    sleeper.innerText = seatNo;

    if (bookedSeatSet.has(seatNo)) {
      sleeper.classList.add("booked");
    } else {
      sleeper.addEventListener("click", () => toggleSeat(seatNo, sleeper));
    }

    if (selectedSeats.includes(seatNo)) {
      sleeper.classList.add("selected");
    }

    sleeperContainer.appendChild(sleeper);
  }
}

function toggleSeat(seatNo, element) {
  const index = selectedSeats.indexOf(seatNo);

  if (index > -1) {
    selectedSeats.splice(index, 1);
    element.classList.remove("selected");
  } else {
    selectedSeats.push(seatNo);
    element.classList.add("selected");
  }

  updateSelectionUI();
}

function updateSelectionUI() {
  if (selectedSeats.length === 0) {
    if (selectedSeatsText) selectedSeatsText.innerText = "None";
    if (seatPills) seatPills.innerHTML = `<span class="pill">None</span>`;
  } else {
    if (selectedSeatsText) selectedSeatsText.innerText = `${selectedSeats.length} seat(s)`;
    if (seatPills) {
      seatPills.innerHTML = selectedSeats
        .map((seat) => `<span class="pill">${seat}</span>`)
        .join("");
    }
  }

  const total = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);
  if (totalPriceText) totalPriceText.innerText = total;
  if (seatTypeSummary) seatTypeSummary.innerText = getSeatTypeLabel();

  updateRouteUI();
  updateBusInfo();
  updateFormSummary();
}

function updateRouteUI() {
  const from = fromInput?.value.trim() || "";
  const to = toInput?.value.trim() || "";
  const date = dateInput?.value || "";

  if (routeText) routeText.innerText = from && to ? `${from} → ${to}` : "Choose your route";
  if (dateText) dateText.innerText = date ? `Travel Date: ${date}` : "Select travel date";
}

function updateFormSummary() {
  if (boardingSummary) boardingSummary.innerText = boardingInput?.value || "Not selected";
  if (droppingSummary) droppingSummary.innerText = droppingInput?.value || "Not selected";

  const passengerName = passengerNameInput?.value.trim() || "";
  const age = passengerAgeInput?.value.trim() || "";
  const gender = passengerGenderInput?.value || "";

  if (passengerSummary) {
    if (passengerName && age && gender) {
      passengerSummary.innerText = `${passengerName}, ${age}, ${gender}`;
    } else if (passengerName) {
      passengerSummary.innerText = passengerName;
    } else {
      passengerSummary.innerText = "Not added";
    }
  }
}

async function parseJsonResponse(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(text.startsWith("<")
      ? "Server returned HTML instead of JSON. Check backend route."
      : "Invalid server response");
  }
}

async function loadBookedSeats() {
  const from = fromInput?.value.trim() || "";
  const to = toInput?.value.trim() || "";
  const date = dateInput?.value || "";

  updateRouteUI();
  updateBusInfo();

  bookedSeatSet = new Set();

  if (!from || !to || !date) {
    createSeaterSeats();
    createSleeperSeats();
    updateSelectionUI();
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/booked-seats?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
    );

    const bookedSeats = await parseJsonResponse(res);

    console.log("Booked seats from DB:", bookedSeats);

    if (Array.isArray(bookedSeats)) {
      bookedSeats.forEach((seat) => bookedSeatSet.add(String(seat).trim()));
    }

    selectedSeats = [];
    createSeaterSeats();
    createSleeperSeats();
    updateSelectionUI();
  } catch (err) {
    console.log("Error loading booked seats:", err);
    createSeaterSeats();
    createSleeperSeats();
    updateSelectionUI();
  }
}

function loadSelectedRoute() {
  const savedFrom = localStorage.getItem("selectedFrom");
  const savedTo = localStorage.getItem("selectedTo");
  const savedDate = localStorage.getItem("selectedDate");

  if (savedFrom && fromInput) fromInput.value = savedFrom;
  if (savedTo && toInput) toInput.value = savedTo;
  if (savedDate && dateInput) dateInput.value = savedDate;

  const fullName = localStorage.getItem("name");
  if (fullName && passengerNameInput) passengerNameInput.value = fullName;

  updateRouteUI();
  updateBoardingDroppingPoints();
  updateFormSummary();
  updateSelectionUI();
  loadBookedSeats();
}

function validateBookingForm() {
  const email = localStorage.getItem("user");
  const from = fromInput?.value.trim() || "";
  const to = toInput?.value.trim() || "";
  const date = dateInput?.value || "";
  const boardingPoint = boardingInput?.value || "";
  const droppingPoint = droppingInput?.value || "";
  const passengerName = passengerNameInput?.value.trim() || "";
  const passengerAge = passengerAgeInput?.value.trim() || "";
  const passengerGender = passengerGenderInput?.value || "";
  const phone = phoneInput?.value.trim() || "";

  if (!email) {
    alert("Login first ❌");
    return null;
  }

  if (!from || !to || !date) {
    alert("Fill From, To and Date ❌");
    return null;
  }

  if (selectedSeats.length === 0) {
    alert("Select at least one seat ❌");
    return null;
  }

  if (!boardingPoint || !droppingPoint) {
    alert("Select boarding and dropping points ❌");
    return null;
  }

  if (!passengerName || !passengerAge || !passengerGender || !phone) {
    alert("Fill all passenger details ❌");
    return null;
  }

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  return {
    email,
    from,
    to,
    date,
    boardingPoint,
    droppingPoint,
    seats: [...selectedSeats],
    price: totalPrice,
    passenger: {
      name: passengerName,
      age: passengerAge,
      gender: passengerGender,
      phone
    },
    busInfo: { ...busInfo },
    seatType: getSeatTypeLabel()
  };
}

async function bookBus() {
  if (isPaymentInProgress) return;

  try {
    const booking = validateBookingForm();
    if (!booking) return;

    isPaymentInProgress = true;
    setButtonLoading(true);

    localStorage.setItem("selectedBooking", JSON.stringify(booking));

    const res = await fetch(`${API_BASE}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: booking.price,
        bookingDetails: booking
      })
    });

    const data = await parseJsonResponse(res);

    if (!res.ok || !data.success || !data.order || !data.key) {
      throw new Error(data.message || "Order creation failed ❌");
    }

    const options = {
      key: data.key,
      amount: data.order.amount,
      currency: "INR",
      name: "Laxmi Holidays",
      description: "Bus Ticket Booking",
      order_id: data.order.id,

      handler: async function (response) {
        try {
          const verify = await fetch(`${API_BASE}/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...response,
              bookingDetails: booking
            })
          });

          const verifyData = await parseJsonResponse(verify);

          if (!verify.ok || !verifyData.success) {
            throw new Error(verifyData.message || "Payment verification failed ❌");
          }

          const bookingRes = await fetch(`${API_BASE}/book`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: booking.email,
              from: booking.from,
              to: booking.to,
              date: booking.date,
              seats: booking.seats.join(","),
              payment_id: verifyData.paymentId,
              order_id: verifyData.orderId,
              boarding_point: booking.boardingPoint,
              dropping_point: booking.droppingPoint,
              passenger_name: booking.passenger.name,
              passenger_age: booking.passenger.age,
              passenger_gender: booking.passenger.gender,
              phone: booking.passenger.phone,
              amount: booking.price,
              operator_name: booking.busInfo.operator,
              bus_type: booking.busInfo.busType,
              departure_time: booking.busInfo.departure,
              arrival_time: booking.busInfo.arrival,
              duration: booking.busInfo.duration
            })
          });

          const bookingData = await parseJsonResponse(bookingRes);

          if (!bookingRes.ok || !bookingData.success) {
            throw new Error(bookingData.message || "Booking failed ❌");
          }

          const finalBooking = {
            ...verifyData.confirmedBooking,
            ...bookingData.confirmedBooking,
            ticketId: bookingData.ticketId,
            status: "Confirmed"
          };

          localStorage.setItem("confirmedBooking", JSON.stringify(finalBooking));
          localStorage.setItem("ticketFrom", finalBooking.from);
          localStorage.setItem("ticketTo", finalBooking.to);
          localStorage.setItem("ticketDate", finalBooking.date);
          localStorage.setItem("ticketSeats", Array.isArray(finalBooking.seats) ? finalBooking.seats.join(", ") : booking.seats.join(", "));
          localStorage.setItem("ticketTotal", finalBooking.price);
          localStorage.setItem("ticketPaymentId", finalBooking.paymentId);
          localStorage.setItem("ticketId", finalBooking.ticketId);

          window.location.href = "confirmation.html";
        } catch (innerError) {
          console.log("Post-payment error:", innerError);
          alert(innerError.message || "Something went wrong after payment ❌");
          isPaymentInProgress = false;
          setButtonLoading(false);
        }
      },

      modal: {
        ondismiss: function () {
          isPaymentInProgress = false;
          setButtonLoading(false);
        }
      },

      prefill: {
        name: booking.passenger.name,
        email: booking.email,
        contact: booking.passenger.phone
      },

      notes: {
        route: `${booking.from} to ${booking.to}`,
        journey_date: booking.date,
        seats: booking.seats.join(", "),
        boarding_point: booking.boardingPoint,
        dropping_point: booking.droppingPoint
      },

      theme: {
        color: "#d84e55"
      }
    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.log("Payment Failed:", response.error);
      alert("Payment Failed: " + (response?.error?.description || "Try again"));
      isPaymentInProgress = false;
      setButtonLoading(false);
    });

    rzp.open();
  } catch (error) {
    console.log("Book bus error:", error);
    alert(error.message || "Something went wrong ❌");
    isPaymentInProgress = false;
    setButtonLoading(false);
  }
}

window.bookBus = bookBus;

if (fromInput) {
  fromInput.addEventListener("change", () => {
    updateBoardingDroppingPoints();
    loadBookedSeats();
  });
  fromInput.addEventListener("input", updateBoardingDroppingPoints);
}

if (toInput) {
  toInput.addEventListener("change", () => {
    updateBoardingDroppingPoints();
    loadBookedSeats();
  });
  toInput.addEventListener("input", updateBoardingDroppingPoints);
}

if (dateInput) dateInput.addEventListener("change", loadBookedSeats);

if (boardingInput) {
  boardingInput.addEventListener("change", () => {
    updateFormSummary();
    updateBusInfo();
    loadBookedSeats();
  });
}

if (droppingInput) {
  droppingInput.addEventListener("change", () => {
    updateFormSummary();
    updateBusInfo();
    loadBookedSeats();
  });
}

if (passengerNameInput) passengerNameInput.addEventListener("input", updateFormSummary);
if (passengerAgeInput) passengerAgeInput.addEventListener("input", updateFormSummary);
if (passengerGenderInput) passengerGenderInput.addEventListener("change", updateFormSummary);
if (phoneInput) phoneInput.addEventListener("input", updateFormSummary);

loadSelectedRoute();