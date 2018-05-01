// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();

//Update popupMessage
ipcRenderer.on('popupMessage', (event, message) => {
    document.getElementById("popupMessage").innerHTML = message.popup;
    playNotificationSound();
});

//Play sound for notifications
function playNotificationSound() {
	var soundName = 'popupSound';
    var audio = new Audio(appPath + '/app/sounds/' + soundName + '.wav');
    audio.currentTime = 0;
    audio.play();
}