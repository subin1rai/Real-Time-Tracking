const socket = io();

// Check if the browser supports geolocation
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Geolocation position: ${latitude}, ${longitude}`); // Debug
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error('Geolocation error:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.error('Geolocation not supported');
}

// Initialize the map
const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap"
}).addTo(map);

// Object to store markers by user id
const markers = {};

// Listen for location updates from the server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  console.log(`Received location for ${id}: ${latitude}, ${longitude}`); // Debug

  // If a marker for this id already exists, update its position
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    // Otherwise, create a new marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    markers[id] = marker;
  }

  // Optionally set the view to the new location
  map.setView([latitude, longitude]);
});

// Handle user disconnection
socket.on("user-disconnect", (id) => {
  console.log(`User disconnected: ${id}`); // Debug
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
