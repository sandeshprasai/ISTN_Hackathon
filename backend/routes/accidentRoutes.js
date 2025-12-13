const express = require("express");
const accidentRouter = express.Router();

const accidentValidation = require("../middlewares/accidentValidation");
const createAccident = require("../controllers/accidentControllers");

accidentRouter.post(
  "/report",
  accidentValidation, // ✅ NO parentheses
  createAccident
);

module.exports = accidentRouter;
