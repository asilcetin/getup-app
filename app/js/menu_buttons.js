const btnQuit = document.getElementById("quit");
const btnStats = document.getElementById("stats");
const btnSettings = document.getElementById("settings");
const btnHome = document.getElementById("home");

const {ipcRenderer} = require('electron')

//Shows named class window and hides others. No flashing since everything is already loaded
function showWindow(windowName)
{
	var windows=document.getElementsByClassName("window");
	for(var i=0;i<windows.length;i++)
	{
		if(windows[i].classList.contains(windowName))
			windows[i].classList.remove("hidden");
		else
			windows[i].classList.add("hidden");
	}
}

btnQuit.addEventListener('click', function (event) {
	ipcRenderer.send('timerQuit');
});

btnSettings.addEventListener('click', function (event) {
	 showWindow("settingsWindow");
});

btnHome.addEventListener('click', function (event) {
	 showWindow("homeWindow")
});

btnStats.addEventListener('click', function (event)
{
	 showWindow("statsWindow");
	 //We need to reload the chart when we focus on this window to display accurate chart info. 
	 ipcRenderer.send('loadChart');
});