const btnQuit = document.getElementById("quit");
const btnStats = document.getElementById("stats");
const btnSettings = document.getElementById("settings");
const btnHome = document.getElementById("home");

const {ipcRenderer} = require('electron')

//Shows named class window and hides others. No flashing since everything is already loaded
function showWindow(windowName, iconName)
{
	var windows=document.getElementsByClassName("window");
	for(var i=0;i<windows.length;i++)
	{
		if(windows[i].classList.contains(windowName))
			windows[i].classList.remove("hidden");
		else
			windows[i].classList.add("hidden");
	}
	var icons=document.getElementsByClassName("icon")
	for(var i=0;i<icons.length;i++)
	{
		if(icons[i].classList.contains(iconName))
			icons[i].classList.add("icon_active");
		else
			icons[i].classList.remove("icon_active");
	}
}

btnQuit.addEventListener('click', function (event) {
	ipcRenderer.send('timerQuit');
});

btnSettings.addEventListener('click', function (event) {
	 showWindow("settingsWindow", "settingsIcon");
});

btnHome.addEventListener('click', function (event) {
	 showWindow("homeWindow","homeIcon")
});

btnStats.addEventListener('click', function (event)
{
	 showWindow("statsWindow","statsIcon");
	 //We need to reload the chart when we focus on this window to display accurate chart info. 
	 ipcRenderer.send('loadChart');
});