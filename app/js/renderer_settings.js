// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();

const sounds_checkbox = document.getElementById('sounds');
const notificationsCheckbox = document.getElementById('notificationsCheck');
const calendarCheckbox = document.getElementById('calendarCheckbox');
var work_notification = document.getElementById('work_notification');
var break_notification = document.getElementById('break_notification');
var work_notification_text = document.getElementById('work_notification_text');
var break_notification_text = document.getElementById('break_notification_text');
var break_notification = document.getElementById('break_notification');
var work_notification = document.getElementById('work_notification');
var google = document.getElementById("google-button");
var logout = document.getElementById("google-button-logout");

work_notification.onkeyup = function(){
    // document.getElementById('printchatbox').innerHTML = inputBox.value;
    if (work_notification.value != 0) {
      ipcRenderer.send('saveCustomWorkNotification', work_notification.value);
    }
}

break_notification.onkeyup = function(){
    if (break_notification.value != 0) {
      ipcRenderer.send('saveCustomBreakNotification', break_notification.value);
    }
}

//For Google auth
google.addEventListener('click', function (event) {
	ipcRenderer.send('google-Oauth');
});
//For logout
logout.addEventListener('click', function (event){
	ipcRenderer.send('google-logout');
});


ipcRenderer.on('hideLogin', 
function(event)
{
	//Hide the login button
	document.getElementById("google-button").classList.add("hidden");
	document.getElementsByClassName("login")[0].classList.add("hidden");
	//Show the logout button
	document.getElementById("google-button-logout").classList.remove("hidden");
});

ipcRenderer.on('showLogin',
function(event)
{
	document.getElementById("google-button").classList.remove("hidden");
	document.getElementsByClassName("login")[0].classList.remove("hidden");
	//Hide the logout button
	document.getElementById("google-button-logout").classList.add("hidden");
});

ipcRenderer.on('enableCalendarCheckbox', function (event){
	calendarCheckbox.disabled=false;
});

ipcRenderer.on('disableCalendarCheckbox', function(event){
	calendarCheckbox.disabled=true;
});

ipcRenderer.send('getSettings');

ipcRenderer.on('soundsCheckbox_fromJson', function (event, value) {
  sounds_checkbox.checked = value;
});

ipcRenderer.on('notificationsCHeckbox_fromJson', function (event, value) {
  notificationsCheckbox.checked = value;
  if(value == true) {
      work_notification.disabled = false;
      break_notification.disabled = false;
      work_notification_text.style.color = 'black';
      break_notification_text.style.color = 'black';
      ipcRenderer.send('saveNotificationsChekbox', true);

    } else {
      work_notification.disabled = true;
      break_notification.disabled = true;
      work_notification_text.style.color = 'gray';
      break_notification_text.style.color = 'gray';
      ipcRenderer.send('saveNotificationsChekbox', false);

    }
});

ipcRenderer.on('calendarCheckbox_fromJson', function (event,value){
	calendarCheckbox.checked = value;
});

ipcRenderer.on('breakNotification_fromJson', function (event, value) {
  break_notification.value = value;
});

ipcRenderer.on('workNotification_fromJson', function (event, value) {
  work_notification.value = value;
});

notificationsCheckbox.addEventListener( 'change', function() {
    if(this.checked) {
      work_notification.disabled = false;
      break_notification.disabled = false;
      work_notification_text.style.color = 'black';
      break_notification_text.style.color = 'black';
      ipcRenderer.send('saveNotificationsChekbox', true);

    } else {
      work_notification.disabled = true;
      break_notification.disabled = true;
      work_notification_text.style.color = 'gray';
      break_notification_text.style.color = 'gray';
      ipcRenderer.send('saveNotificationsChekbox', false);

    }
});

sounds_checkbox.addEventListener( 'change', function() {
    if(this.checked) {
      ipcRenderer.send('saveSoundsChekbox', true);
    } else {
      ipcRenderer.send('saveSoundsChekbox', false);

    }
});

calendarCheckbox.addEventListener( 'change', function(){
	if(this.checked){
		ipcRenderer.send('saveCalendarCheckbox', true);
	} else {
		ipcRenderer.send('saveCalendarCheckbox', false);
	}
});