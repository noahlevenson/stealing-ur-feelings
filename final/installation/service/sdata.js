const io = require("socket.io").listen(8000);

const K_CONSUMERS_ROOM_NAME = "CONSUMERS";

// We have one special socket.io room: "CONSUMERS"
// The film itself is a producer, since it creates data and sends it to the data service
// The external visualization client is a consumer, since it needs that data to create a visual display

// When the film itself connects to the data service, it doesn't issue a join request.  
// Rather, it just starts sending data to the server using a socket.on("data") event

// When the data visualization connects to the data service, it issues a join request for room "CONSUMERS"

// On the "data" event, the server broadcasts the incoming data to all consumers in the CONSUMERS room 

let clients = 0;

io.on("connection", (socket) => {
	clients += 1;
	console.log(`a client connected... total clients: ${clients}`);

	socket.on("joinRequest", (room) => {
		if (room === K_CONSUMERS_ROOM_NAME) {
			console.log(`incoming join request from data consumer`);
			socket.join(room);
		} else {
			console.log(`bad incoming join request: room "${room}"`);
		}
	});

	socket.on("data", (data) => {
		// console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("data", data);
	});

	socket.on("dogs", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("dogs", data);
	});

	socket.on("gender", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("gender", data);
	});

	socket.on("kanyeStart", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("kanyeStart", data);
	});

	socket.on("kanyeEnd", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("kanyeEnd", data);
	});

	socket.on("kanye", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("kanye", data);
	});

	socket.on("pizzaStart", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("pizzaStart", data);
	});

	socket.on("pizzaEnd", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("pizzaEnd", data);
	});

	socket.on("pizza", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("pizza", data);
	});

	socket.on("race", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("race", data);
	});

	socket.on("datingPreference", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("datingPreference", data);
	});

	socket.on("socialNews", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("socialNews", data);
	});

	socket.on("politicalOrientation", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("politicalOrientation", data);
	});

	socket.on("iq", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("iq", data);
	});

	socket.on("estimatedIncome", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("estimatedIncome", data);
	});

	socket.on("mentalHealth", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("mentalHealth", data);
	});

	socket.on("selfImage", (data) => {
		console.log(data);
		io.in(K_CONSUMERS_ROOM_NAME).emit("selfImage", data);
	});

	socket.on("disconnect", () => {		
		clients -= 1;
		console.log(`a client disconnected... total clients: ${clients}`);
  	});
});

console.log("\nstealing ur feelings data service");
console.log("by noah levenson\n");
console.log("listening for connections...");