// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
const IntroJs = require('intro.js');


const remainingDuration = document.getElementById("remainingDuration");
const exerciseDuration = document.getElementById("exerciseDuration");
const workDuration = document.getElementById("workDuration");

const btnStop = document.getElementById("stop");
const btnPlayPause = document.getElementById("playPause");

const btnExerciseUp = document.getElementById("exerciseUp");
const btnExerciseDown = document.getElementById("exerciseDown");

const btnWorkUp = document.getElementById("workUp");
const btnWorkDown = document.getElementById("workDown");

const appIntro = IntroJs();

//Seconds into mins:secs converter
function convertTime (seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	//Padding one-digit numbers with a zero
	if (seconds < 10) { seconds = "0" + seconds };
	return minutes + ":" + seconds;
}
//Convert seconds to minutes
function toMinutes(seconds)
{
	return Math.floor(seconds/60);
}


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
		btnPlayPause.firstChild.innerHTML="&#xe801;";
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

//Functions from main telling us stuff

ipcRenderer.on('work', 
function (event, value)
{
	workDuration.innerHTML=convertTime(value);
});

ipcRenderer.on('exercise', 
function (event, value)
{
	exerciseDuration.innerHTML=convertTime(value);
});

ipcRenderer.on('init', 
function (event, object)
{
	workDuration.innerHTML=convertTime(object.workDuration);
	exerciseDuration.innerHTML=convertTime(object.exerciseDuration);
	remainingDuration.innerHTML=convertTime(object.remainingDuration);
}
);

ipcRenderer.on('startTutorial', 
function (event, object)
{
	appIntro.start();
}
);

// After intro is finished, start the timer
appIntro.onexit(function () {
  ipcRenderer.send('timerResume');
});

ipcRenderer.on('timeUpdate',
function(event, value)
{
	remainingDuration.innerHTML=convertTime(value);
});
