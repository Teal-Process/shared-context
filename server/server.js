var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){  
	console.log('a user connected');

	socket.on('movement', function(data){
		console.log('movement fired');

		// sending to all clients except sender
		socket.broadcast.emit('movement', data);
	});

	socket.on('connected', function(data){
		console.log('connected fired');

		// sending to all clients except sender
		socket.broadcast.emit('connected', data);
	});
});

http.listen(3000, function(){
  console.log('listening on 3000');
});