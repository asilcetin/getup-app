// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();

// const checkbox = document.getElementById('notificationsCheck');
const checkbox = document.querySelector('input[id=notificationsCheck]');


checkbox.addEventListener( 'change', function() {
  console.log('checkbox click');
  handleNotifications();
    if(this.checked) {
        // Checkbox is checked..
    } else {
        // Checkbox is not checked..
    }
});


document.addEventListener("DOMContentLoaded", function (event) {
    var _selector = document.querySelector('input[name=notificationsCheck]');
    _selector.addEventListener('change', function (event) {
      console.log('checkbox click');
  handleNotifications();
        if (_selector.checked) {
            // do something if checked
        } else {
            // do something else otherwise
        }
    });
});





//Update popupMessage
ipcRenderer.on('popupMessage', (event, message) => {
	var sounds = document.getElementById('sounds');
	document.getElementById("popupMessage").innerHTML = message.popup;
	console.log
	if (sounds.checked == true) {
    	playNotificationSound();
	}
});


checkbox.addEventListener('change', function (event) {
  console.log('checkbox click');
  handleNotifications();
}

function handleNotifications(){
    var checkbox = document.getElementById('notificationsCheck');
    var work_notification = document.getElementById('work_notification');
    var break_notification = document.getElementById('break_notification');
    var work_notification_text = document.getElementById('work_notification_text');
    var break_notification_text = document.getElementById('break_notification_text');


  if (checkbox.checked != true){
  	work_notification.disabled = true;
  	break_notification.disabled = true;
  	work_notification_text.style.color = 'gray';
  	break_notification_text.style.color = 'gray';
    // alert("you need to be fluent in English to apply for the job");
	} else {
  		work_notification.disabled = false;
  		break_notification.disabled = false;
  		work_notification_text.style.color = 'black';
  		break_notification_text.style.color = 'black';
	}
}

//Play sound for notifications
function playNotificationSound() {
	var soundName = 'popupSound';
    var audio = new Audio(appPath + '/app/sounds/' + soundName + '.wav');
    audio.currentTime = 0;
    audio.play();
}