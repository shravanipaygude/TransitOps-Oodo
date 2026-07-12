const express = require("express");
const router = express.Router();

const {
  getVehicles,
  addVehicle,
} = require("../controllers/vehicleController");

router.get("/", getVehicles);
router.post("/", addVehicle);

module.exports = router;
