const io = require('socket.io-client');

const socket = io('http://localhost:3000');

document.onmousemove = function(event) {
	console.log("We are currently tracking your mouse. More to come soon.");

	let data = {
		x: event.pageX,
		y: event.pageY
	}

	console.log(data);
	socket.emit('movement', data);
}

socket.on('movement', function(data) {
	console.log('notified of movement', data);
});