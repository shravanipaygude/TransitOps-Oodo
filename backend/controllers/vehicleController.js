const pool = require("../config/db");

// GET all vehicles
const getVehicles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles ORDER BY vehicle_id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching vehicles" });
  }
};

// ADD vehicle
const addVehicle = async (req, res) => {
  try {
    const {
      registration_number,
      vehicle_name,
      vehicle_type,
      max_load_capacity,
      status,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles
      (registration_number, vehicle_name, vehicle_type, max_load_capacity, status)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        registration_number,
        vehicle_name,
        vehicle_type,
        max_load_capacity,
        status,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding vehicle" });
  }
};

module.exports = {
  getVehicles,
  addVehicle,
};