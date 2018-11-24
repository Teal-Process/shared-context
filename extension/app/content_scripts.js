// TODO
// - on updateScroll, somehow get and update the mouse position, as it's moved down the page but hasn't fired the mousemove event 
// - create function / event firing for disconnection, when a friend leaves the page

const io = require('socket.io-client');

const socket = io('http://localhost:3000');
let gather = new Gatherer(socket);
gather.connect();

let presenter = new PresentMode();
let friendsPresent = [];

// will also need to find a way to get all users already connected their own indicator
// let indicator = new Indicator();


function createNewIndicator(uid) {
	let friendMouseExists = document.getElementById('friend-mouse' + uid);
	if (friendMouseExists == null) {
		console.log('createNewIndicator', uid)

		// add mouse indicator
		let mouseIndicator = document.createElement("div");
		mouseIndicator.id = "friend-mouse" + uid;
		mouseIndicator.className = "mouseIndicator indicator--is-hidden";
		document.body.appendChild(mouseIndicator);
		
		// add scroll indicator
		let scrollIndicator = document.createElement("div");
		scrollIndicator.id = "friend-scroll" + uid;
		scrollIndicator.className = "scrollIndicator indicator--is-hidden";
		scrollIndicator.addEventListener('click', function(e){
			console.log(e.target.id);
			presenter.toggleFollow(e.target.id);
		});
		document.body.appendChild(scrollIndicator);
	}
}

function toggleClass(id, activeClass){
	let el = document.getElementById(id);
	console.log(el, id);

	if (el.classList.contains(activeClass)) {		
		el.classList.remove(activeClass);
	} else {
		el.classList.add(activeClass);
	}
}

function getPageHeight() {
	let body = document.body,
		html = document.documentElement;

	let height = Math.max( body.scrollHeight, body.offsetHeight, 
	           html.clientHeight, html.scrollHeight, html.offsetHeight );

	return height;
}

document.onmousemove = function(e) {
	// console.log("We are currently tracking your mouse. More to come soon.");
	gather.updateMouse(e);
}

document.onscroll = function(e) {
	// console.log("We are currently tracking your scroll. More to come soon.");
	gather.updateScroll(e);
}

socket.on('movement', function(data) {
	if(data.href == window.location.href) {
		console.log('ur friend moved', data);
		console.log(friendsPresent);
		if(!friendsPresent.includes(data.uid)) {
			friendsPresent.push(data.uid);
			// create and/or show friend elements 
			createNewIndicator(data.uid);
			let hiddenClass = 'indicator--is-hidden';
			let elementIds = ['friend-mouse' + data.uid, 'friend-scroll' + data.uid];
			for(let i = 0; i < elementIds.length; i++){
				let el = document.getElementById(elementIds[i]);
				if (el.classList.contains(hiddenClass)) {		
					el.classList.remove(hiddenClass);
				}
			}
		}

		// move friend mouse position
		document.getElementById('friend-mouse' + data.uid).style.top = data.mouse.y + "px";
		document.getElementById('friend-mouse' + data.uid).style.left = data.mouse.x + "px";

		// move friend scroll position
		presenter.setFriendScroll(data.scrollPercentage);
		let friendIndicator = data.scrollPercentage * window.innerHeight;
		document.getElementById('friend-scroll' + data.uid).style.top = friendIndicator + "px";
	} else {

		/* Need to move all of this to some kind of 
			disconnect function / event firing */

		// hide friend elements 
		// let hiddenClass = 'indicator--is-hidden';
		// let elementIds = ['friend-mouse' + data.uid, 'friend-scroll' + data.uid];
		// for(let i = 0; i < elementIds.length - 1; i++){
		// 	let el = document.getElementById(elementIds[i]);
		// 	if (!el.classList.contains(hiddenClass)) {		
		// 		el.classList.add(hiddenClass);
		// 	}
		// }

		// console.log(friendsPresent);
		// friendsPresent(friendsPresent.indexOf(data.uid),1);
		// console.log(friendsPresent);
	}
});

socket.on('connected', function(data) {
	console.log('a friend is here!', data);
	createNewIndicator(data.uid)
});

function Gatherer(socket) {
	this.uid = null;
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

		let pageHeight = getPageHeight();
		let scrollPercentage = this.scrollY / pageHeight;

		let href = window.location.href;

		let data = {
			uid: this.uid,
			mouse: this.mouse,
			scrollPercentage: scrollPercentage,
			view: view,
			href: href
		};

		socket.emit(message, data);
	}
}

function PresentMode(){
	this.friendScrollPercentage = 0;
  	this.following = false;

  	// scroll to friend position and start following
  	this.toggleFollow = function(indicatorId){
  		let activeClass = 'scrollIndicator--is-active';
  		toggleClass(indicatorId, activeClass);

  		if(this.following){
  			this.following = false;
  		} else {
  			this.scrollToFriend();
  			this.following = true;
  		}
  	}

  	this.setFriendScroll = function(percentage){
  		this.friendScrollPercentage = percentage;
  		if(this.following){
  			this.scrollToFriend();
  		}
  	}

  	this.scrollToFriend = function(){
  		let scrollTop = this.friendScrollPercentage * getPageHeight();

  		// on first click, smooth scroll, otherwise
  		// we want to jump to each new scroll point
  		let scrollBehavior;
  		if(this.following) {
  			scrollBehavior = 'auto';
  		} else {
  			scrollBehavior = 'smooth';
  		}

  		window.scrollTo({
		  top: scrollTop,
		  behavior: scrollBehavior
		});
  	}
}


