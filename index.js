require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Set up the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Route to fetch prayer times by city
app.get("/prayer-times/:city", async (req, res) => {
  const { city } = req.params;

  try {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    // Query for today's prayer times
    const query = `
      SELECT date, imsaak, fajr, dhur, maghrib 
      FROM ${city.toLowerCase()}_prayer_times 
      WHERE date = $1
    `;
    const result = await pool.query(query, [todayString]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No prayer times found for today in the database." });
    }

    // Send back the first (and only) row for today
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error querying prayer times for city: ${city}`, err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching prayer times." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});