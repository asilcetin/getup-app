// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();
const btnQuit = document.getElementById("quit");

btnQuit.addEventListener('click', function (event) {
	console.log("Pressed quit!");
  ipcRenderer.send('timerQuit');
})