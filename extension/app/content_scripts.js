const io = require('socket.io-client');

const socket = io('http://localhost:3000');
let gather = new Gatherer();
gather.connect();

// will also need to find a way to get all users already connected their own indicator
// let indicator = new Indicator();

// ----------------------
// on load...
// let link = document.createElement("link");
// link.href = "./styles.css";
// link.type = "text/css";
// link.rel = "stylesheet";
// document.getElementsByTagName("head")[0].appendChild(link);

// ----------------------


document.onmousemove = function(e) {
	console.log("We are currently tracking your mouse. More to come soon.");
	gather.updateMouse(e);
}

document.onscroll = function(e) {
	console.log("We are currently tracking your scroll. More to come soon.");
	gather.updateScroll(e);
}

function createNewIndicator(uid) {
	console.log('createNewIndicator', uid)
	let mouseIndicator = document.createElement("p");
	mouseIndicator.id = "friend-mouse" + uid;
	mouseIndicator.className = "mouseIndicator";
	mouseIndicator.style.height = "16px"
	mouseIndicator.style.width = "16px"
	mouseIndicator.style.background = "blue"
	mouseIndicator.style.opacity = "0.75"
	mouseIndicator.style.position = "absolute"
	mouseIndicator.style.top = "0"
	mouseIndicator.style.margin = "0"
	document.body.appendChild(mouseIndicator);

	let scrollIndicator = document.createElement("p");
	scrollIndicator.id = "friend-scroll" + uid;
	scrollIndicator.className = "scrollIndicator";
	scrollIndicator.style.height = "12px";
	scrollIndicator.style.width = "12px";
	scrollIndicator.style.background = "blue";
	scrollIndicator.style.position = "absolute";
	scrollIndicator.style.borderRadius = "24px";
	scrollIndicator.style.right = "16px";
	scrollIndicator.style.top = "0px";
	scrollIndicator.style.margin = "0";
	document.body.appendChild(scrollIndicator);
}

function Gatherer() {

	this.scrollY = 0;
	this.mouse = {
		x: 0,
		y: 0
	};

	this.getUid = function(){
		const min = Math.ceil(10);
		const max = Math.floor(10000);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	this.connect = function(){
		this.uid = this.getUid();
		this.sendData('connected');
	}

	this.updateScroll = function(e){
		this.scrollY = window.scrollY;

		this.sendData('movement');
	}

	this.updateMouse = function(e){
		this.mouse.x = e.pageX;
		this.mouse.y = e.pageY;

		this.sendData('movement');
	}

	this.sendData = function(message){
		let view = {
			width: window.innerWidth,
			height: window.innerHeight
		};

		console.log('uid', this.uid)

		let html = document.getElementsByTagName('html')[0];
		console.log(html.style.height);

		let data = {
			uid: this.uid,
			mouse: this.mouse,
			scrollY: this.scrollY,
			view: view
		};

		socket.emit(message, data);
	}
}


socket.on('movement', function(data) {
	console.log('a friend is here too!', data);
	// let parsed = 'Another user: ' + data.mouse.x + ', ' + data.mouse.y;
	// document.getElementById('data').innerText = parsed;

	const mouseId = 'friend-mouse' + data.uid
	const mouseElement = document.getElementById(mouseId)
	mouseElement.style.top = data.mouse.y + "px";
	mouseElement.style.left = data.mouse.x + "px";

	// TODO
	// – get the page height and showcase the scroll position (friend-scroll) relative to that
	// - on updateScroll, somehow get and update the mouse position, as it's moved down the page but hasn't fired the mousemove event 

	const scrollId = 'friend-scroll' + data.uid
	document.getElementById(scrollId).style.top = data.scrollY + "px";
});

socket.on('connected', function(data) {
	console.log('notified of connection', data);
	createNewIndicator(data.uid)
});