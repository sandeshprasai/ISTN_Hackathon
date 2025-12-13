// services/locationService.js
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

async function getNearestByDriving(accidentLocation, locations) {
  const destinations = locations.map(l => ({
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

  const distances = response.data.rows[0].elements.map((elem, index) => ({
    location: locations[index],
    distanceMeters: elem.distance.value,
    durationSec: elem.duration.value,
  }));

  distances.sort((a, b) => a.distanceMeters - b.distanceMeters);

  return distances.slice(0, 3).map(d => ({
    _id: d.location._id,
    name: d.location.name,
    phone: d.location.phone,
    address: d.location.address,
    distanceKm: +(d.distanceMeters / 1000).toFixed(2),
    durationMin: Math.round(d.durationSec / 60),
  }));
}

module.exports = { getNearestByDriving };