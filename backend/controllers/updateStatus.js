const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");

exports.updateAccidentStatus = async (req, res) => {
  try {
    let { _id } = req.params;
    const { status } = req.body;

    // ✅ Trim whitespace/newlines
    _id = _id.trim();

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accident ID format",
      });
    }

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const updatedAccident = await Accident.findByIdAndUpdate(
      _id,
      {
        status,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedAccident) {
      return res.status(404).json({
        success: false,
        message: "Accident record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Accident ${status.toLowerCase()}`,
      data: updatedAccident,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};
