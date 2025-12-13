const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

async function getNearestByDriving(accidentLocation, locations) {
  const BATCH_SIZE = 25;
  const validLocations = locations.filter(
    l => l.location?.coordinates?.length === 2 &&
         typeof l.location.coordinates[0] === "number" &&
         typeof l.location.coordinates[1] === "number"
  );

  let allDistances = [];

  for (let i = 0; i < validLocations.length; i += BATCH_SIZE) {
    const batch = validLocations.slice(i, i + BATCH_SIZE);

    const destinations = batch.map(l => ({
      lat: l.location.coordinates[1],
      lng: l.location.coordinates[0],
    }));

    const response = await client.distancematrix({
      params: {
        origins: [{ lat: accidentLocation.latitude, lng: accidentLocation.longitude }],
        destinations,
        mode: "driving",
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (!response.data.rows?.[0]?.elements) {
      console.warn("Invalid Google API response for batch", i, batch);
      continue;
    }

    const distances = response.data.rows[0].elements.map((elem, index) => ({
      location: batch[index],
      distanceMeters: elem.distance.value,
      durationSec: elem.duration.value,
    }));

    allDistances = allDistances.concat(distances);
  }

  allDistances.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return allDistances.slice(0, 3).map(d => ({
    _id: d.location._id,
    name: d.location.name,
    phone: d.location.phone,
    address: d.location.address,
    distanceKm: +(d.distanceMeters / 1000).toFixed(2),
    durationMin: Math.round(d.durationSec / 60),
  }));
}

// ✅ Correct export
module.exports = { getNearestByDriving };