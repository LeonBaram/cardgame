const socket = new WebSocket("ws://localhost:3000");

socket.onopen = (event) => {
  socket.send("conk");
};
