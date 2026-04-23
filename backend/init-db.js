require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const db = mysql.createConnection({
  uri: process.env.MYSQL_PUBLIC_URL,
  multipleStatements: true
});

const sqlPath = path.join(__dirname, "..", "database.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

db.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
    process.exit(1);
  }

  console.log("Connected to Railway MySQL ✅");

  db.query(sql, (err) => {
    if (err) {
      console.error("SQL import failed:", err);
      db.end();
      process.exit(1);
    }

    console.log("database.sql imported successfully ✅");
    db.end();
  });
});