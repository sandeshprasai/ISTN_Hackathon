// backend/socket/handlers/ambulanceHandler.js
const { 
  handleAmbulanceAcceptance, 
  handleAmbulanceRejection 
} = require("../../services/dispatchAmbulance.service");

const setupAmbulanceHandlers = (socket) => {
  // Ambulance accepts emergency
  socket.on("emergency:accept", async (data) => {
    console.log(`📥 Ambulance accepted:`, data);
    
    const result = await handleAmbulanceAcceptance({
      ...data,
      socketId: socket.id
    });
    
    socket.emit("emergency:accept:response", result);
  });

  // Ambulance rejects emergency
  socket.on("emergency:reject", async (data) => {
    console.log(`📥 Ambulance rejected:`, data);
    
    const result = await handleAmbulanceRejection(data);
    socket.emit("emergency:reject:response", result);
  });

  // Ambulance acknowledges cancellation
  socket.on("emergency:cancelled:ack", (data) => {
    console.log(`Ambulance acknowledged cancellation:`, data);
    // Update ambulance status if needed
  });
};