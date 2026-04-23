require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("Railway MySQL Connected ✅");
  }
});

module.exports = db;