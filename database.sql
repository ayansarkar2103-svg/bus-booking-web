DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100)
);

DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(100),
  from_city VARCHAR(50),
  to_city VARCHAR(50),
  travel_date DATE,
  seats VARCHAR(50),
  amount INT,
  payment_id VARCHAR(100),
  booking_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
