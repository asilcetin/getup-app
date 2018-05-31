// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

const btnPause = document.getElementById('btnPause')
const btnResume = document.getElementById('btnResume')
const btnStop = document.getElementById('btnStop')
const btnQuit = document.getElementById('btnQuit')

const btnSettings = document.getElementById('btnSettings')
const btnHome = document.getElementById('btnHome')

const btnSaveSettings = document.getElementById('btnSaveSettings')

btnPause.addEventListener('click', function (event) {
  ipcRenderer.send('timerPause')
})

btnResume.addEventListener('click', function (event) {
  ipcRenderer.send('timerResume')
})

btnStop.addEventListener('click', function (event) {
  ipcRenderer.send('timerStop')
})

btnQuit.addEventListener('click', function (event) {
  ipcRenderer.send('timerQuit')
})

btnSaveSettings.addEventListener('click', function (event) {
        let defaultTimeLeft = document.getElementById('defaultTimeLeft').value;
        ipcRenderer.send('saveSettings', defaultTimeLeft);
});

btnSettings.addEventListener('click', function (event) {
  window.location = "settings.html";
})

btnHome.addEventListener('click', function (event) {
  window.location = "index.html";
})

//Update the total session stat
ipcRenderer.on('totalCyclesToday', (event, message) => {
    document.getElementById("todaysCyles").innerHTML = message.cycles;
});