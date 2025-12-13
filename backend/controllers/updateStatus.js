const mongoose = require("mongoose");
const Accident = require("../model/accident_schema");
const Ambulance = require("../model/ambulance.model");
const PoliceStation = require("../model/PoliceStation.model");
const { getNearestByDriving } = require("../services/locationService");

exports.updateAccidentStatus = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ success: false, message: "Invalid accident ID" });
    if (!["ACCEPTED", "REJECTED"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status value" });

    // Update status
    const updatedAccident = await Accident.findByIdAndUpdate(
      _id,
      { status, reviewedAt: new Date() },
      { new: true }
    );
    if (!updatedAccident) return res.status(404).json({ success: false, message: "Accident not found" });

    if (status === "ACCEPTED") {
      const { latitude, longitude } = updatedAccident.location;

      if (latitude != null && longitude != null) {
        // Get ambulances and police stations
        const ambulances = await Ambulance.find({});
        const policeStations = await PoliceStation.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [longitude, latitude] },
      distanceField: "distance",
      spherical: true,
    },
  },
  { $limit: 20 } // ✅ move limit here
]);

        const nearestAmbulances = await getNearestByDriving({ latitude, longitude }, ambulances);
        const nearestPoliceStations = await getNearestByDriving({ latitude, longitude }, policeStations);

        console.log("Nearest ambulances:", nearestAmbulances);
        console.log("Nearest police stations:", nearestPoliceStations);

        // TODO: Trigger notifications here
      }
    }

    return res.status(200).json({
      success: true,
      message: `Accident ${status.toLowerCase()}`,
      data: updatedAccident,
    });
  } catch (error) {
    return next(error);
  }
};