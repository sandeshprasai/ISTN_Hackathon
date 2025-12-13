// backend/services/dispatchAmbulance.service.js
const Ambulance = require("../model/ambulance.model");
const { getNearestByDriving } = require("./locationService");

const dispatchAmbulance = async (accident) => {
  try {
    console.log(
      `🚨 DISPATCHING: Accident ${accident._id} at ${new Date().toISOString()}`
    );

    // 1. Get only AVAILABLE ambulances with socket connections
    const ambulances = await Ambulance.find({
      status: "AVAILABLE",
      socketId: { $exists: true, $ne: null },
    });

    console.log(`📊 Available ambulances: ${ambulances.length}`);

    if (ambulances.length === 0) {
      console.log("⚠️ No available ambulances with active connections");
      return { dispatched: false, reason: "No available ambulances" };
    }

    // 2. Find nearest using your existing function
    const nearest = await getNearestByDriving(
      {
        latitude: accident.location.coordinates[1],
        longitude: accident.location.coordinates[0],
      },
      ambulances
    );

    console.log(`📍 Nearest ambulances found: ${nearest.length}`);

    let dispatchedCount = 0;
    nearest.forEach((amb) => {
      const matched = ambulances.find(
        (a) => a._id.toString() === amb._id.toString()
      );

      if (matched?.socketId) {
        console.log(
          `📡 Notifying ambulance: ${matched.name} (${matched.socketId})`
        );

        const emergencyData = {
          accidentId: accident._id,
          id: accident._id,
          patientName: "Emergency Case",
          location: accident.address || "Accident Location",
          distance: `${amb.distanceKm} km`,
          time: "Just now",
          priority: accident.severity || "high",
          lat: accident.location.coordinates[1],
          lng: accident.location.coordinates[0],
          description: accident.description,
          imageUrl: accident.imageUrl,
          reportedAt: accident.createdAt,
          verified: true, // Mark as verified
        };

        // Send to specific ambulance
        global.io.to(matched.socketId).emit("emergency:new", emergencyData);
        dispatchedCount++;
      }
    });

    console.log(`✅ Dispatched to ${dispatchedCount} ambulance(s)`);

    return {
      dispatched: dispatchedCount > 0,
      count: dispatchedCount,
      ambulances: nearest.map((a) => ({
        id: a._id,
        name: a.name,
        distance: a.distanceKm,
      })),
    };
  } catch (error) {
    console.error("❌ Dispatch error:", error);
    return { dispatched: false, error: error.message };
  }
};

module.exports = { dispatchAmbulance };
