// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')

const remainingDuration = document.getElementById("remainingDuration");
const exerciseDuration = document.getElementById("exerciseDuration");
const workDuration = document.getElementById("workDuration");

const btnStop = document.getElementById("stop");
const btnPlayPause = document.getElementById("playPause");

const btnQuit = document.getElementById("quit");
const btnStats = document.getElementById("stats");
const btnSettings = document.getElementById("settings");
const btnHome = document.getElementById("home");

const btnExerciseUp = document.getElementById("exerciseUp");
const btnExerciseDown = document.getElementById("exerciseDown");

const btnWorkUp = document.getElementById("workUp");
const btnWorkDown = document.getElementById("workDown");

//Send a request to main gor data
ipcRenderer.send('getData');

//Witness the power of CSS and Javascript working in unison!!!
btnPlayPause.addEventListener('click', function (event) {
	//If the timer is running, the control will be of this class,
	//it will show a pause button and be orange colored based on class css
	//In that case we want it to pause the timer
	if(btnPlayPause.classList.contains("runningPlayPauseControl"))
	{
		btnPlayPause.classList.toggle("runningPlayPauseControl");
		btnPlayPause.firstChild.innerHTML="&#xe803;";
		ipcRenderer.send('timerPause');
	}
	//If the timer isn't running, it won't be of the runningPlayPauseControl class
	//We want to add that class to it, which changes its color and marks it as running
	//and we want to change the inner html of the 1st child (the <i> tag) to a pause button icon
	else
	{
		btnPlayPause.classList.toggle("runningPlayPauseControl");
		btnPlayPause.firstChild.innerHTML="&#xe801";
		ipcRenderer.send('timerResume');
	}
})

btnStop.addEventListener('click', function (event) {
	//If the stop button is pressed, we also need to set the play/pause button back to play
	btnPlayPause.classList.remove("runningPlayPauseControl");
	btnPlayPause.firstChild.innerHTML="&#xe803";
	ipcRenderer.send('timerStop');
});

btnExerciseUp.addEventListener('click', function (event)
{
	ipcRenderer.send("exerciseUp");
});

btnExerciseDown.addEventListener('click', function (event)
{
	ipcRenderer.send("exerciseDown");
});

btnWorkUp.addEventListener('click', function (event)
{
	ipcRenderer.send("workUp");
});

btnWorkDown.addEventListener('click', function (event)
{
	ipcRenderer.send("workDown");
});

btnQuit.addEventListener('click', function (event) {
	console.log("Pressed quit!");
  ipcRenderer.send('timerQuit');
})


btnSettings.addEventListener('click', function (event) {
  window.location = "settings.html";
})

btnHome.addEventListener('click', function (event) {
  window.location = "index.html";
})

//Functions from main telling us stuff

ipcRenderer.on('work', 
function (event, value)
{
	workDuration.innerHTML=value;
});

ipcRenderer.on('exercise', 
function (event, value)
{
	exerciseDuration.innerHTML=value;
});

ipcRenderer.on('init', 
function (event, object)
{
	workDuration.innerHTML=object.workDuration;
	exerciseDuration.innerHTML=object.exerciseDuration;
	remainingDuration.innerHTML=object.remainingDuration;
}
);

ipcRenderer.on('timeUpdate',
function(event, value)
{
	remainingDuration.innerHTML=value;
});
