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
var work_notification = document.getElementById('work_notification');
var break_notification = document.getElementById('break_notification');
var work_notification_text = document.getElementById('work_notification_text');
var break_notification_text = document.getElementById('break_notification_text');
var break_notification = document.getElementById('break_notification');
var work_notification = document.getElementById('work_notification');

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

ipcRenderer.send('getSettings');

ipcRenderer.on('soundsCheckbox_fromJson', function (event, value) {
  sounds_checkbox.checked = value;
})

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
})

ipcRenderer.on('breakNotification_fromJson', function (event, value) {
  break_notification.placeholder = value;
})

ipcRenderer.on('workNotification_fromJson', function (event, value) {
  work_notification.placeholder = value;
})

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