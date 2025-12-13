const Accident = require("../model/accident_schema");

const createAccident = async (req, res) => {
  try {
    const accident = await Accident.create(req.body);

    res.status(201).json({
      message: "Accident reported successfully",
      data: accident,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create accident report",
      error: error.message,
    });
  }
};

module.exports = createAccident;
