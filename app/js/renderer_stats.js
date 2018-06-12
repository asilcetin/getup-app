// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

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


//Display data received from backend in the chart
ipcRenderer.on('chartData', 
function (event, object)
{
	data=object.data;
	labels=object.labels;
	//Generate chart
	var myChart = new Chart(ctx, {
		type: 'bar',
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
