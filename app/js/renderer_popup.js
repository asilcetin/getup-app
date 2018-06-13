// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();
var notification_image = document.getElementById('notification_image');
var popupMessage = document.getElementById('popupMessage');

//Update popupMessage
ipcRenderer.on('popupMessage', (event, message, type) => {
	var sounds = document.getElementById('sounds');
	if (type == 'work') {
		notification_image.src = 'icons/work_iconTemplate@2x.png';
	} else if (type == 'break') {
		notification_image.src = 'icons/break_iconTemplate@2x.png';
	}
	document.getElementById("popupMessage").innerHTML = message.popup;
	console.log
	if (sounds.checked == true) {
    	playNotificationSound();
	}
});

//Play sound for notifications
function playNotificationSound() {
	var soundName = 'popupSound';
    var audio = new Audio(appPath + '/app/sounds/' + soundName + '.wav');
    audio.currentTime = 0;
    audio.play();
}