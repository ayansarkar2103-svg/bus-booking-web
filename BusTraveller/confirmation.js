const booking = JSON.parse(localStorage.getItem("confirmedBooking")) || {};
const name = localStorage.getItem("name") || booking.name || "Passenger";
const email = localStorage.getItem("user") || booking.email || "";

function safeValue(value, fallback = "N/A") {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function seatsToText(seats) {
  if (Array.isArray(seats)) return seats.join(", ");
  return safeValue(seats);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = safeValue(value);
  }
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Browser notifications are not supported.");
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().catch((err) => {
      console.error("Notification permission error:", err);
    });
  }
}

function showMailNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    });
  } else {
    alert(body);
  }
}

function populateTicketDetails() {
  const routeText = `${safeValue(booking.from)} → ${safeValue(booking.to)}`;
  const seatsText = seatsToText(booking.seats);
  const statusText = safeValue(booking.status, "CONFIRMED");

  // Main fields
  setText("name", name);
  setText("email", email);
  setText("route", routeText);
  setText("from", booking.from);
  setText("to", booking.to);
  setText("date", booking.date);
  setText("seats", seatsText);
  setText("total", `₹${safeValue(booking.price, "0")}`);
  setText("price", `₹${safeValue(booking.price, "0")}`);
  setText("paymentId", booking.paymentId);
  setText("ticketId", booking.ticketId);
  setText("status", statusText);

  // Bus/travel fields
  setText("operatorName", booking.operatorName || "Luxury Travels");
  setText("operatorNameDuplicate", booking.operatorName || "Luxury Travels");
  setText("departureTime", booking.departureTime || "N/A");
  setText("departureTimeDuplicate", booking.departureTime || "N/A");
  setText("arrivalTime", booking.arrivalTime || "N/A");
  setText("durationTime", booking.duration || "N/A");
  setText("seatType", booking.busType || "Seater + Sleeper • Premium AC");
  setText("seatTypeText", booking.busType || "Seater + Sleeper • Premium AC");
  setText("boardingPoint", booking.boardingPoint || "Main Boarding Point");
  setText("droppingPoint", booking.droppingPoint || "Main Dropping Point");

  // Legacy keys support
  setText("ticketFrom", booking.from);
  setText("ticketTo", booking.to);
  setText("ticketDate", booking.date);
  setText("ticketSeats", seatsText);
  setText("ticketTotal", `₹${safeValue(booking.price, "0")}`);
  setText("ticketPaymentId", booking.paymentId);

  // Optional visual status change
  const statusEl = document.getElementById("status");
  if (statusEl) {
    if (statusText === "CANCELLED") {
      statusEl.style.color = "#dc2626";
      statusEl.style.fontWeight = "700";
    } else {
      statusEl.style.color = "#16a34a";
      statusEl.style.fontWeight = "700";
    }
  }
}

function ensureBookingDefaults() {
  if (!booking.ticketId) {
    booking.ticketId = localStorage.getItem("ticketId") || ("LH" + Date.now().toString().slice(-6));
    localStorage.setItem("ticketId", booking.ticketId);
  }

  if (!booking.name) booking.name = name;
  if (!booking.email) booking.email = email;
  if (!booking.status) booking.status = "CONFIRMED";

  localStorage.setItem("confirmedBooking", JSON.stringify(booking));
}

function maybeShowEmailSentNotification() {
  if (!booking.emailNotificationShown) {
    showMailNotification(
      "Confirmation Email Sent",
      "Your booking confirmation email with attached ticket has been sent successfully."
    );

    booking.emailNotificationShown = true;
    localStorage.setItem("confirmedBooking", JSON.stringify(booking));
  }
}

async function cancelTicket() {
  try {
    const currentBooking = JSON.parse(localStorage.getItem("confirmedBooking")) || {};

    if (!currentBooking || !currentBooking.email) {
      alert("Booking details not found.");
      return;
    }

    if (currentBooking.status === "CANCELLED") {
      alert("This ticket is already cancelled.");
      return;
    }

    const cancelBtn = document.getElementById("cancelTicketBtn");
    if (cancelBtn) {
      cancelBtn.disabled = true;
      cancelBtn.innerText = "Cancelling...";
    }

    const response = await fetch("http://localhost:5000/cancel-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(currentBooking),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Cancellation failed");
    }

    const updatedBooking = {
      ...currentBooking,
      ...data.booking,
      status: "CANCELLED",
      cancellationEmailNotificationShown: true,
    };

    localStorage.setItem("confirmedBooking", JSON.stringify(updatedBooking));

    showMailNotification(
      "Cancellation Email Sent",
      "Your cancellation email with cancelled ticket attachment has been sent successfully."
    );

    alert("Ticket cancelled successfully.");
    window.location.reload();
  } catch (error) {
    console.error("Cancel ticket error:", error);
    alert(error.message || "Something went wrong while cancelling the ticket.");
  } finally {
    const cancelBtn = document.getElementById("cancelTicketBtn");
    if (cancelBtn) {
      cancelBtn.disabled = false;
      cancelBtn.innerText = "Cancel Ticket";
    }
  }
}

function attachCancelHandler() {
  const cancelBtn = document.getElementById("cancelTicketBtn");
  if (!cancelBtn) return;

  cancelBtn.addEventListener("click", cancelTicket);

  const currentBooking = JSON.parse(localStorage.getItem("confirmedBooking")) || {};
  if (currentBooking.status === "CANCELLED") {
    cancelBtn.disabled = true;
    cancelBtn.innerText = "Ticket Cancelled";
    cancelBtn.style.opacity = "0.7";
    cancelBtn.style.cursor = "not-allowed";
  }
}

function protectPageIfNotLoggedIn() {
  const loggedInUser = localStorage.getItem("user");
  if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
  }
}

window.addEventListener("load", () => {
  protectPageIfNotLoggedIn();
  requestNotificationPermission();
  ensureBookingDefaults();
  populateTicketDetails();
  attachCancelHandler();

  const currentBooking = JSON.parse(localStorage.getItem("confirmedBooking")) || {};
  if (currentBooking.status === "CONFIRMED") {
    maybeShowEmailSentNotification();
  }
});