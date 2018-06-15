// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron');
const {shell} = require('electron');

//Getting the root path of the application
const remote = require('electron').remote;
const app = remote.app;
var appPath = app.getAppPath();
//For charts
require("../js/Chart.bundle.js");
//Canvas
var ctx=document.getElementById("stats_canvas").getContext("2d");
//Var to display chart data
var data=0;
var labels=0;
//The google calendar button
var calendarButton=document.getElementById("google-button-calendar");

//Open Google Calendar if this button is clicked
calendarButton.addEventListener('click', function(event){
	shell.openExternal('https://calendar.google.com');
});

ipcRenderer.on('hideCalendarButton', function(event){
	calendarButton.classList.add('hidden');
});

ipcRenderer.on('showCalendarButton', function(event){
	calendarButton.classList.remove('hidden');
});

//Display data received from backend in the chart
ipcRenderer.on('chartData', 
function (event, object)
{
	data=object.data;
	labels=object.labels;
	//Generate chart
	var myChart = new Chart(ctx, {
		type: 'horizontalBar',
		data: {
        labels: labels,
        datasets: 
		[
		{
			data: data,
            label: '# of cycles',
			backgroundColor: "rgb(16,178,0)"
        }
		]
    }
	});
});
