require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -----------------------------
// RAZORPAY SETUP
// -----------------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// -----------------------------
// EMAIL SETUP
// -----------------------------
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



// -----------------------------
// HELPERS
// -----------------------------
function safeValue(value, fallback = "N/A") {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function normalizeSeats(seats) {
  if (Array.isArray(seats)) return seats.join(", ");
  return safeValue(seats);
}

function ensureTicketId(booking) {
  if (!booking.ticketId) {
    booking.ticketId = "LH" + Date.now().toString().slice(-6);
  }
  return booking.ticketId;
}

function generateTicketPDFBuffer(booking, status = "CONFIRMED") {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const name = safeValue(booking.name, "Passenger");
      const email = safeValue(booking.email);
      const from = safeValue(booking.from);
      const to = safeValue(booking.to);
      const date = safeValue(booking.date);
      const seats = normalizeSeats(booking.seats);
      const price = safeValue(booking.price || booking.total || booking.amount, "0");
      const paymentId = safeValue(booking.paymentId);
      const ticketId = ensureTicketId(booking);
      const operatorName = safeValue(booking.operatorName, "Laxmi Holidays Express");
      const departureTime = safeValue(booking.departureTime);
      const arrivalTime = safeValue(booking.arrivalTime);
      const duration = safeValue(booking.duration);
      const boardingPoint = safeValue(booking.boardingPoint, "Main Boarding Point");
      const droppingPoint = safeValue(booking.droppingPoint, "Main Dropping Point");
      const busType = safeValue(booking.busType, "Seater + Sleeper • Premium AC");

      const isCancelled = status === "CANCELLED";
      const primaryColor = isCancelled ? "#c62828" : "#d84e55";
      const lightColor = isCancelled ? "#fff3f3" : "#fff6f7";
      const borderColor = "#e5e7eb";
      const textDark = "#111827";
      const textMuted = "#6b7280";

      // Page background
      doc.rect(0, 0, 595, 842).fill("#f4f6fb");

      // Main card
      doc.roundedRect(28, 24, 539, 794, 22).fill("#ffffff");
      doc.roundedRect(28, 24, 539, 794, 22).strokeColor(borderColor).lineWidth(1).stroke();

      // Header
      doc.save();
      doc.roundedRect(28, 24, 539, 110, 22).clip();
      doc.rect(28, 24, 539, 110).fill(primaryColor);
      doc.restore();

      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(26);
      doc.text("LAXMI HOLIDAYS", 48, 48);

      doc.font("Helvetica").fontSize(12);
      doc.text("Premium Bus Ticket", 48, 82);

      doc.roundedRect(430, 48, 95, 30, 12).fill("#ffffff");
      doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(11);
      doc.text(isCancelled ? "CANCELLED" : "CONFIRMED", 446, 58, {
        width: 70,
        align: "center"
      });

      // Route section
      doc.roundedRect(48, 155, 499, 78, 16).fill(lightColor);
      doc.roundedRect(48, 155, 499, 78, 16).strokeColor("#f1d7db").lineWidth(1).stroke();

      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(24);
      doc.text(`${from} --> ${to}`, 68, 180, {
        width: 420,
        align: "left"
      });

      doc.fillColor(textMuted).font("Helvetica").fontSize(11);
      doc.text(`Journey Date: ${date}`);

      // Top info cards
      const cardY = 260;
      const cardW = 145;
      const cardH = 72;
      const gap = 16;
      const startX = 48;

      const cards = [
        { title: "Departure", value: departureTime },
        { title: "Arrival", value: arrivalTime },
        { title: "Duration", value: duration }
      ];

      cards.forEach((item, index) => {
        const x = startX + index * (cardW + gap);
        doc.roundedRect(x, cardY, cardW, cardH, 14).fill("#ffffff");
        doc.roundedRect(x, cardY, cardW, cardH, 14).strokeColor(borderColor).lineWidth(1).stroke();

        doc.fillColor(textMuted).font("Helvetica").fontSize(11);
        doc.text(item.title, x + 14, cardY + 14);

        doc.fillColor(textDark).font("Helvetica-Bold").fontSize(18);
        doc.text(item.value, x + 14, cardY + 36, {
          width: cardW - 28
        });
      });

      // Left box
      doc.roundedRect(48, 365, 235, 220, 16).fill("#ffffff");
      doc.roundedRect(48, 365, 235, 220, 16).strokeColor(borderColor).lineWidth(1).stroke();

      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(15);
      doc.text("Passenger Details", 64, 385);

      const leftFields = [
        ["Passenger", name],
        ["Email", email],
        ["Seats", seats],
        ["Bus Type", busType]
      ];

      let leftY = 420;
      leftFields.forEach(([label, value]) => {
        doc.fillColor(textMuted).font("Helvetica").fontSize(10);
        doc.text(label, 64, leftY);

        doc.fillColor(textDark).font("Helvetica-Bold").fontSize(12);
        doc.text(value, 64, leftY + 14, {
          width: 195
        });

        leftY += 46;
      });

      // Right box
      doc.roundedRect(312, 365, 235, 220, 16).fill("#ffffff");
      doc.roundedRect(312, 365, 235, 220, 16).strokeColor(borderColor).lineWidth(1).stroke();

      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(15);
      doc.text("Booking Details", 328, 385);

      const rightFields = [
        ["Ticket ID", ticketId],
        ["Payment ID", paymentId],
        ["Operator", operatorName],
        ["Total Paid", `Rs ${price}`]
      ];

      let rightY = 420;
      rightFields.forEach(([label, value], idx) => {
        doc.fillColor(textMuted).font("Helvetica").fontSize(10);
        doc.text(label, 328, rightY);

        doc.fillColor(idx === 3 ? primaryColor : textDark)
          .font("Helvetica-Bold")
          .fontSize(idx === 3 ? 18 : 12);
        doc.text(value, 328, rightY + 14, {
          width: 195
        });

        rightY += 46;
      });

      // Boarding / Dropping
      doc.roundedRect(48, 610, 499, 110, 16).fill("#ffffff");
      doc.roundedRect(48, 610, 499, 110, 16).strokeColor(borderColor).lineWidth(1).stroke();

      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(15);
      doc.text("Boarding and Dropping", 64, 628);

      doc.fillColor(textMuted).font("Helvetica").fontSize(10);
      doc.text("Boarding Point", 64, 660);
      doc.text("Dropping Point", 315, 660);

      doc.fillColor(textDark).font("Helvetica-Bold").fontSize(12);
      doc.text(boardingPoint, 64, 676, {
        width: 210
      });
      doc.text(droppingPoint, 315, 676, {
        width: 180
      });

      // QR style block
      doc.roundedRect(430, 735, 85, 55, 10).fill("#ffffff");
      doc.roundedRect(430, 735, 85, 55, 10).strokeColor(borderColor).lineWidth(1).stroke();

      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if ((i + j) % 2 === 0) {
            doc.rect(442 + i * 10, 746 + j * 8, 5, 5).fill("#111827");
          }
        }
      }

      // Footer note
      doc.fillColor(textMuted).font("Helvetica").fontSize(9);
      doc.text(
        "Please carry a valid ID proof and arrive at the boarding point at least 15 minutes before departure.",
        48,
        744,
        { width: 330 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function confirmationEmailHTML(booking) {
  const name = safeValue(booking.name, "Passenger");
  const from = safeValue(booking.from);
  const to = safeValue(booking.to);
  const date = safeValue(booking.date);
  const seats = normalizeSeats(booking.seats);
  const ticketId = safeValue(booking.ticketId);
  const price = safeValue(booking.price, "0");
  const boardingPoint = safeValue(booking.boardingPoint);
  const droppingPoint = safeValue(booking.droppingPoint);
  const departureTime = safeValue(booking.departureTime);
  const arrivalTime = safeValue(booking.arrivalTime);
  const duration = safeValue(booking.duration);
  const operatorName = safeValue(booking.operatorName, "Laxmi Holidays Express");
  const busType = safeValue(booking.busType, "Seater + Sleeper • Premium AC");

  return `
    <div style="margin:0;padding:28px;background:#f4f7fb;font-family:Arial,sans-serif;">
      <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
        
        <div style="background:#d84e55;padding:30px 32px;color:#ffffff;">
          <div style="font-size:28px;font-weight:800;letter-spacing:0.3px;">LAXMI HOLIDAYS</div>
          <div style="margin-top:6px;font-size:13px;">Booking Confirmation</div>

          <div style="margin-top:22px;background:rgba(255,255,255,0.14);padding:18px 20px;border-radius:16px;">
            <div style="font-size:24px;font-weight:800;line-height:1.4;">${from} --> ${to}</div>
            <div style="margin-top:8px;font-size:13px;line-height:1.6;">${date} | ${departureTime} - ${arrivalTime} | ${duration}</div>
          </div>
        </div>

        <div style="padding:30px 32px;color:#111827;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#4b5563;">
            Your booking has been confirmed successfully. Your ticket PDF is attached with this email.
          </p>

          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:0 10px 16px 0;vertical-align:top;">
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px;">
                  <div style="font-size:11px;color:#6b7280;">Operator</div>
                  <div style="margin-top:6px;font-size:15px;font-weight:700;">${operatorName}</div>
                </div>
              </td>
              <td style="width:50%;padding:0 0 16px 10px;vertical-align:top;">
                <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px;">
                  <div style="font-size:11px;color:#6b7280;">Bus Type</div>
                  <div style="margin-top:6px;font-size:15px;font-weight:700;">${busType}</div>
                </div>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:6px;">
            <tr>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:13px;font-weight:700;width:38%;">Ticket ID</td>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:13px;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;font-weight:700;">Seats</td>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;">${seats}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:13px;font-weight:700;">Boarding Point</td>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:13px;">${boardingPoint}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;font-weight:700;">Dropping Point</td>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;">${droppingPoint}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:13px;font-weight:700;">Total Fare</td>
              <td style="padding:14px 16px;background:#fff6f7;border:1px solid #f1d4d8;font-size:16px;font-weight:800;color:#d84e55;">Rs ${price}</td>
            </tr>
          </table>

          <div style="margin-top:22px;background:#eff6ff;border:1px solid #dbeafe;border-radius:14px;padding:16px;color:#1e3a8a;font-size:13px;line-height:1.8;">
            Please reach the boarding point at least 15 minutes before departure and carry a valid ID proof.
          </div>
        </div>
      </div>
    </div>
  `;
}

function cancellationEmailHTML(booking) {
  const name = safeValue(booking.name, "Passenger");
  const from = safeValue(booking.from);
  const to = safeValue(booking.to);
  const date = safeValue(booking.date);
  const seats = normalizeSeats(booking.seats);
  const ticketId = safeValue(booking.ticketId);
  const boardingPoint = safeValue(booking.boardingPoint);
  const droppingPoint = safeValue(booking.droppingPoint);
  const operatorName = safeValue(booking.operatorName, "Laxmi Holidays Express");

  return `
    <div style="margin:0;padding:28px;background:#fff5f5;font-family:Arial,sans-serif;">
      <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
        
        <div style="background:#c62828;padding:30px 32px;color:#ffffff;">
          <div style="font-size:28px;font-weight:800;letter-spacing:0.3px;">LAXMI HOLIDAYS</div>
          <div style="margin-top:6px;font-size:13px;">Ticket Cancellation</div>

          <div style="margin-top:22px;background:rgba(255,255,255,0.14);padding:18px 20px;border-radius:16px;">
            <div style="font-size:24px;font-weight:800;line-height:1.4;">${from} --> ${to}</div>
            <div style="margin-top:8px;font-size:13px;line-height:1.6;">${date}</div>
          </div>
        </div>

        <div style="padding:30px 32px;color:#111827;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 22px;font-size:14px;line-height:1.8;color:#4b5563;">
            Your ticket has been cancelled successfully. The cancelled ticket PDF is attached for your reference.
          </p>

          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:0 10px 16px 0;vertical-align:top;">
                <div style="background:#fff7f7;border:1px solid #f3d6d6;border-radius:14px;padding:16px;">
                  <div style="font-size:11px;color:#6b7280;">Operator</div>
                  <div style="margin-top:6px;font-size:15px;font-weight:700;">${operatorName}</div>
                </div>
              </td>
              <td style="width:50%;padding:0 0 16px 10px;vertical-align:top;">
                <div style="background:#fff7f7;border:1px solid #f3d6d6;border-radius:14px;padding:16px;">
                  <div style="font-size:11px;color:#6b7280;">Status</div>
                  <div style="margin-top:6px;font-size:15px;font-weight:700;color:#c62828;">Cancelled</div>
                </div>
              </td>
            </tr>
          </table>

          <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:6px;">
            <tr>
              <td style="padding:14px 16px;background:#fff7f7;border:1px solid #f3d6d6;font-size:13px;font-weight:700;width:38%;">Ticket ID</td>
              <td style="padding:14px 16px;background:#fff7f7;border:1px solid #f3d6d6;font-size:13px;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;font-weight:700;">Seats</td>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;">${seats}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#fff7f7;border:1px solid #f3d6d6;font-size:13px;font-weight:700;">Boarding Point</td>
              <td style="padding:14px 16px;background:#fff7f7;border:1px solid #f3d6d6;font-size:13px;">${boardingPoint}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;font-weight:700;">Dropping Point</td>
              <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;font-size:13px;">${droppingPoint}</td>
            </tr>
          </table>

          <div style="margin-top:22px;background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:16px;color:#991b1b;font-size:13px;line-height:1.8;">
            This cancelled ticket is no longer valid for travel. Please keep this email for your records.
          </div>
        </div>
      </div>
    </div>
  `;
}

async function sendBookingEmail(booking) {
  if (!booking.email) throw new Error("Passenger email is missing.");

  ensureTicketId(booking);
  const pdfBuffer = await generateTicketPDFBuffer(booking, "CONFIRMED");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.email,
    subject: "Booking Confirmed - Your Bus Ticket",
    html: confirmationEmailHTML(booking),
    attachments: [
      {
        filename: `ticket-${booking.ticketId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

async function sendCancellationEmail(booking) {
  if (!booking.email) throw new Error("Passenger email is missing.");

  ensureTicketId(booking);
  const pdfBuffer = await generateTicketPDFBuffer(booking, "CANCELLED");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: booking.email,
    subject: "Ticket Cancelled - Cancellation Confirmation",
    html: cancellationEmailHTML(booking),
    attachments: [
      {
        filename: `cancelled-ticket-${booking.ticketId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

// -----------------------------
// AUTH ROUTES
// -----------------------------
app.post("/signup", (req, res) => {
  let { firstName, lastName, email, password } = req.body;

  firstName = String(firstName || "").trim();
  lastName = String(lastName || "").trim();
  email = String(email || "").trim().toLowerCase();
  password = String(password || "").trim();

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";

  db.query(checkQuery, [email], (err, result) => {
    if (err) {
      console.log("Check user error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const insertQuery =
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";

    db.query(insertQuery, [firstName, lastName, email, password], (err) => {
      if (err) {
        console.log("Insert user error:", err);
        return res.status(500).json({
          success: false,
          message: "Signup failed",
        });
      }

      return res.json({
        success: true,
        message: "Signup successful",
      });
    });
  });
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;

  email = String(email || "").trim().toLowerCase();
  password = String(password || "").trim();

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const query = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, result) => {
    if (err) {
      console.log("Login DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result[0];

    return res.json({
      success: true,
      message: "Login successful",
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
    });
  });
});

// -----------------------------
// SEAT + BOOKING ROUTES
// -----------------------------
app.get("/booked-seats", (req, res) => {
  const { from, to, date, departureTime } = req.query;

  if (!from || !to || !date) {
    return res.json([]);
  }

  let query = `
    SELECT seats
    FROM bookings
    WHERE from_city = ?
      AND to_city = ?
      AND travel_date = ?
      AND booking_status = 'Confirmed'
  `;

  const params = [from, to, date];

  if (departureTime) {
    query += ` AND departure_time = ?`;
    params.push(departureTime);
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.log("Booked seats DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error while checking seats",
      });
    }

    const seats = [];

    result.forEach((row) => {
      const splitSeats = String(row.seats || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      seats.push(...splitSeats);
    });

    return res.json(seats);
  });
});

// -----------------------------
// PAYMENT ROUTES
// -----------------------------
app.post("/create-order", async (req, res) => {
  try {
    const { amount, bookingDetails } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
      notes: {
        from: bookingDetails?.from || "",
        to: bookingDetails?.to || "",
        date: bookingDetails?.date || "",
      },
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create order",
    });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const confirmedBooking = {
      email: bookingDetails.email,
      from: bookingDetails.from,
      to: bookingDetails.to,
      date: bookingDetails.date,
      seats: bookingDetails.seats,
      price: bookingDetails.price,
      boardingPoint: bookingDetails.boardingPoint,
      droppingPoint: bookingDetails.droppingPoint,
      name: bookingDetails.passenger?.name || "Passenger",
      age: bookingDetails.passenger?.age || "",
      gender: bookingDetails.passenger?.gender || "",
      phone: bookingDetails.passenger?.phone || "",
      operatorName: bookingDetails.busInfo?.operator || "Laxmi Holidays Express",
      busType: bookingDetails.busInfo?.busType || "Seater + Sleeper • Premium AC",
      departureTime: bookingDetails.busInfo?.departure || "N/A",
      arrivalTime: bookingDetails.busInfo?.arrival || "N/A",
      duration: bookingDetails.busInfo?.duration || "N/A",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "Confirmed",
    };

    return res.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      confirmedBooking,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during payment verification",
    });
  }
});

app.post("/book", async (req, res) => {
  try {
    const {
      email,
      from,
      to,
      date,
      seats,
      payment_id,
      order_id,
      boarding_point,
      dropping_point,
      passenger_name,
      passenger_age,
      passenger_gender,
      phone,
      amount,
      operator_name,
      bus_type,
      departure_time,
      arrival_time,
      duration,
    } = req.body;

    if (
      !email || !from || !to || !date || !seats || !payment_id || !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing booking details",
      });
    }

    const seatList = String(seats)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let checkSeatQuery = `
      SELECT seats
      FROM bookings
      WHERE from_city = ?
        AND to_city = ?
        AND travel_date = ?
        AND booking_status = 'Confirmed'
    `;

    const checkParams = [from, to, date];

    if (departure_time) {
      checkSeatQuery += ` AND departure_time = ?`;
      checkParams.push(departure_time);
    }

    db.query(checkSeatQuery, checkParams, async (checkErr, checkRows) => {
      if (checkErr) {
        console.log("Seat check DB error:", checkErr);
        return res.status(500).json({
          success: false,
          message: "Database error while checking seats",
        });
      }

      const alreadyBooked = new Set();

      checkRows.forEach((row) => {
        String(row.seats || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((seat) => alreadyBooked.add(seat));
      });

      const conflictingSeat = seatList.find((seat) => alreadyBooked.has(seat));

      if (conflictingSeat) {
        return res.status(409).json({
          success: false,
          message: `Seat ${conflictingSeat} is already booked`,
        });
      }

      const insertQuery = `
  INSERT INTO bookings (
    user_email,
    from_city,
    to_city,
    travel_date,
    seats,
    amount,
    payment_id,
    booking_status,
    departure_time,
    boarding_point,
    dropping_point,
    passenger_name,
    passenger_age,
    passenger_gender,
    phone,
    operator_name,
    bus_type,
    arrival_time,
    duration
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const values = [
  String(email).trim().toLowerCase(),
  from,
  to,
  date,
  seatList.join(", "),
  amount,
  payment_id,
  "Confirmed",
  departure_time || null,
  boarding_point || null,
  dropping_point || null,
  passenger_name || "Passenger",
  passenger_age || null,
  passenger_gender || null,
  phone || null,
  operator_name || "Laxmi Holidays Express",
  bus_type || "Seater + Sleeper • Premium AC",
  arrival_time || null,
  duration || null,
];

      db.query(insertQuery, values, async (insertErr) => {
        if (insertErr) {
          console.log("Booking insert error:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to save booking",
          });
        }

        const confirmedBooking = {
          ticketId: payment_id,
          email,
          from,
          to,
          date,
          seats: seatList,
          paymentId: payment_id,
          orderId: order_id || "",
          boardingPoint: boarding_point || req.body.boardingPoint || "N/A",
          droppingPoint: dropping_point || req.body.droppingPoint || "N/A",
          name: passenger_name || "Passenger",
          age: passenger_age || "",
          gender: passenger_gender || "",
          phone: phone || "",
          price: amount,
          operatorName: operator_name || "Laxmi Holidays Express",
          busType: bus_type || "Seater + Sleeper • Premium AC",
          departureTime: departure_time || "N/A",
          arrivalTime: arrival_time || "N/A",
          duration: duration || "N/A",
          status: "Confirmed",
        };

        sendBookingEmail(confirmedBooking).catch((emailErr) => {
          console.log("Booking email send error:", emailErr);
        });

        return res.json({
          success: true,
          message: "Booking saved successfully",
          ticketId: payment_id,
          confirmedBooking,
        });
      });
    });
  } catch (error) {
    console.log("Book route error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save booking",
    });
  }
});

app.post("/send-ticket-email", async (req, res) => {
  try {
    const payload = req.body?.ticket || req.body;

    const booking = {
      email: req.body?.to || payload.email,
      name: payload.passenger || payload.name,
      from: payload.from,
      to: payload.to,
      date: payload.date,
      seats: payload.seats,
      price: payload.total || payload.price || payload.amount,
      paymentId: payload.paymentId,
      ticketId: payload.ticketId || payload.paymentId,
      boardingPoint: payload.boardingPoint,
      droppingPoint: payload.droppingPoint,
      operatorName: payload.operatorName || "Laxmi Holidays Express",
      busType: payload.busType || "Seater + Sleeper • Premium AC",
      departureTime: payload.departureTime || "N/A",
      arrivalTime: payload.arrivalTime || "N/A",
      duration: payload.duration || "N/A",
    };

    await sendBookingEmail(booking);

    return res.json({
      success: true,
      message: "Ticket email sent successfully",
    });
  } catch (error) {
    console.log("Send ticket email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send ticket email",
    });
  }
});

// -----------------------------
// CANCELLATION ROUTE
// -----------------------------
app.post("/cancel-ticket", async (req, res) => {
  try {
    const paymentId = req.body.paymentId || req.body.payment_id || req.body.ticketId;
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!paymentId || !email) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and email are required",
      });
    }

    db.query(
      "SELECT * FROM bookings WHERE payment_id = ? AND user_email = ? LIMIT 1",
      [paymentId, email],
      async (findErr, rows) => {
        if (findErr) {
          console.log("Find booking error:", findErr);
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Booking not found",
          });
        }

        const booking = rows[0];

        db.query(
          "UPDATE bookings SET booking_status = 'Cancelled' WHERE payment_id = ? AND user_email = ?",
          [paymentId, email],
          async (updateErr) => {
            if (updateErr) {
              console.log("Cancel update DB error:", updateErr);
              return res.status(500).json({
                success: false,
                message: "Failed to cancel booking",
              });
            }

            const cancelBookingData = {
              ticketId: booking.payment_id,
              email: booking.user_email,
              from: booking.from_city,
              to: booking.to_city,
              date: booking.travel_date,
              seats: booking.seats,
              price: booking.amount,
              paymentId: booking.payment_id,
              boardingPoint: req.body.boardingPoint || "Main Boarding Point",
              droppingPoint: req.body.droppingPoint || "Main Dropping Point",
              name: req.body.name || "Passenger",
              operatorName: req.body.operatorName || "Laxmi Holidays Express",
              busType: req.body.busType || "Seater + Sleeper • Premium AC",
              departureTime: booking.departure_time || "N/A",
              arrivalTime: req.body.arrivalTime || "N/A",
              duration: req.body.duration || "N/A",
              status: "Cancelled",
            };

            try {
              await sendCancellationEmail(cancelBookingData);
            } catch (mailErr) {
              console.log("Cancellation email error:", mailErr);
            }

            return res.json({
              success: true,
              message: "Ticket cancelled successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Cancel ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel ticket",
    });
  }
});

// -----------------------------
// MY BOOKINGS ROUTE
// -----------------------------
app.get("/my-bookings", (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const query = `
    SELECT
      id,
      user_email,
      from_city,
      to_city,
      travel_date,
      seats,
      amount,
      payment_id,
      booking_status,
      departure_time,
      created_at
    FROM bookings
    WHERE user_email = ?
    ORDER BY created_at DESC
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.log("My bookings DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load bookings",
      });
    }

    const bookings = results.map((row) => ({
      ticket_id: row.payment_id,
      email: row.user_email,
      from_city: row.from_city,
      to_city: row.to_city,
      journey_date: row.travel_date,
      seats: row.seats,
      payment_id: row.payment_id,
      amount: row.amount,
      status: row.booking_status,
      departure_time: row.departure_time,
      created_at: row.created_at,
    }));

    return res.json({
      success: true,
      bookings,
    });
  });
});

// -----------------------------
// DOWNLOAD TICKET ROUTE
// -----------------------------
app.get("/download-ticket/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;

  const query = `
    SELECT *
    FROM bookings
    WHERE payment_id = ?
    LIMIT 1
  `;

  db.query(query, [ticketId], async (err, results) => {
    if (err) {
      console.log("Download ticket DB error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    try {
      const booking = results[0];

      const ticketData = {
        ticketId: booking.payment_id,
        email: booking.user_email,
        name: booking.passenger_name || "Passenger",
        from: booking.from_city,
        to: booking.to_city,
        date: booking.travel_date,
        seats: booking.seats,
        price: booking.amount,
        paymentId: booking.payment_id,

        boardingPoint: booking.boarding_point || "N/A",
        droppingPoint: booking.dropping_point || "N/A",

        operatorName: booking.operator_name || "Laxmi Holidays Express",
        busType: booking.bus_type || "Seater + Sleeper • Premium AC",

        departureTime: booking.departure_time || "N/A",
        arrivalTime: booking.arrival_time || "N/A",
        duration: booking.duration || "N/A",

        status: booking.booking_status || "Confirmed",
      };

      const pdfBuffer = await generateTicketPDFBuffer(
        ticketData,
        booking.booking_status === "Cancelled" ? "CANCELLED" : "CONFIRMED"
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="ticket-${booking.payment_id}.pdf"`
      );

      return res.send(pdfBuffer);
    } catch (pdfErr) {
      console.log("PDF generation error:", pdfErr);
      return res.status(500).json({
        success: false,
        message: "Failed to generate ticket PDF",
      });
    }
  });
});

// -----------------------------
// TEST ROUTE
// -----------------------------
app.get("/", (req, res) => {
  res.send("Bus booking backend is running...");
});

app.get("/test-email", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email from Bus App",
      text: "Email is working ✅",
    });

    res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    console.log("Test email error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// -----------------------------

// START SERVER
// -----------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});