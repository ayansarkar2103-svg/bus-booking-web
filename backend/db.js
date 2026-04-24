require("dotenv").config();
const mysql = require("mysql2");

// Railway gives full connection string
const connection = mysql.createConnection(process.env.MYSQL_PUBLIC_URL);

connection.connect((err) => {
  if (err) {
    console.error("DB Connection Failed ❌", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = connection;

