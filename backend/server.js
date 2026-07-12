const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db");

const vehicleRoutes = require("./routes/vehicleRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Vehicle API
app.use("/api/vehicles", vehicleRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("TransitOps Backend is Running 🚛");
});

// Test Database Connection
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      time: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});