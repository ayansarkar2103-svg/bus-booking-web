const bookingTableBody = document.getElementById("bookingTableBody");
const totalBookingsEl = document.getElementById("totalBookings");
const totalSeatsEl = document.getElementById("totalSeats");
const upcomingTripsEl = document.getElementById("upcomingTrips");
const userNameEl = document.getElementById("userName");

const API_BASE = "https://bus-booking-web-app-production.up.railway.app";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB");
}

function isUpcoming(dateStr) {
  if (!dateStr) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tripDate = new Date(dateStr);
  tripDate.setHours(0, 0, 0, 0);

  return tripDate >= today;
}

function parseSeatCount(seats) {
  if (!seats) return 0;

  return String(seats)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function renderBookings(bookings) {
  if (!bookingTableBody) {
    console.error("bookingTableBody not found in HTML");
    return;
  }

  bookingTableBody.innerHTML = "";

  if (!bookings || bookings.length === 0) {
    bookingTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
          No bookings found
        </td>
      </tr>
    `;
    return;
  }

  bookings.forEach((booking) => {
    const refundText =
      booking.status === "Cancelled"
        ? (booking.refund_amount ? `₹ ${booking.refund_amount}` : "Processed")
        : "-";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${booking.from_city} → ${booking.to_city}</td>
      <td>${formatDate(booking.journey_date)}</td>
      <td>${booking.seats}</td>
      <td>₹ ${booking.amount}</td>
      <td>${booking.status}</td>
      <td>${refundText}</td>
      <td style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="preview-btn" onclick="downloadTicket('${booking.ticket_id}')">
          Ticket Preview
        </button>
        ${
          booking.status === "Confirmed"
            ? `<button class="cancel-btn" onclick="cancelBooking('${booking.ticket_id}')">Cancel</button>`
            : `<span style="color: gray;">Cancelled</span>`
        }
      </td>
    `;

    bookingTableBody.appendChild(row);
  });
}

function updateStats(bookings) {
  const totalBookings = bookings.length;
  const totalSeats = bookings.reduce((sum, booking) => sum + parseSeatCount(booking.seats), 0);
  const upcomingTrips = bookings.filter(
    (booking) => booking.status === "Confirmed" && isUpcoming(booking.journey_date)
  ).length;

  if (totalBookingsEl) totalBookingsEl.innerText = totalBookings;
  if (totalSeatsEl) totalSeatsEl.innerText = totalSeats;
  if (upcomingTripsEl) upcomingTripsEl.innerText = upcomingTrips;
}

async function parseJsonResponse(res) {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON response:", text);
    throw new Error("Server returned invalid response");
  }
}

async function loadMyBookings() {
  const email = localStorage.getItem("user");
  const name = localStorage.getItem("name");

  if (userNameEl) {
    userNameEl.innerText = name || "Traveler";
  }

  if (!email) {
    alert("Please login first ❌");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/my-bookings?email=${encodeURIComponent(email)}`);
    const data = await parseJsonResponse(response);

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load bookings");
    }

    const bookings = data.bookings || [];
    renderBookings(bookings);
    updateStats(bookings);
  } catch (error) {
    console.error("Load bookings error:", error);
    alert("Error loading bookings ❌");
  }
}

function downloadTicket(ticketId) {
  if (!ticketId) {
    alert("Ticket ID missing ❌");
    return;
  }

  const link = document.createElement("a");
  link.href = `${API_BASE}/download-ticket/${ticketId}`;
  link.download = `ticket-${ticketId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function cancelBooking(ticketId) {
  const email = localStorage.getItem("user");

  if (!ticketId || !email) {
    alert("Missing booking details ❌");
    return;
  }

  const confirmCancel = confirm("Are you sure you want to cancel this ticket?");
  if (!confirmCancel) return;

  try {
    const response = await fetch(`${API_BASE}/cancel-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        paymentId: ticketId,
        ticketId: ticketId,
        email: email
      })
    });

    const data = await parseJsonResponse(response);

    if (!response.ok || !data.success) {
      alert(data.message || "Cancellation failed ❌");
      return;
    }

    alert("Ticket cancelled successfully ✅");
    loadMyBookings();
    
  } catch (error) {
    console.error("Cancel booking error:", error);
    alert("Error cancelling booking ❌");
  }
}



function goToTrip() {
  window.location.href = "trip.html";
}

function goToHome() {
  window.location.href = "index.html";
}
window.cancelBooking = cancelBooking;
window.downloadTicket = downloadTicket;
window.goToTrip = goToTrip;
window.goToHome = goToHome;


loadMyBookings();