/**
 * 
 * Electron app setup
 *
 */
 
const electron = require('electron');
const {app, BrowserWindow, Tray, ipcMain} = electron;

const path = require('path')
const url = require('url')
const Store = require('./store.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window
let tray
let popup

//For logging events we'll set the start and stop times for every event 
var breakStartTime=0;
var breakStopTime=0;
var workStartTime=0;
var workStopTime=0;
var workPauseStartTime=0;
var workPauseStopTime=0;
var breakPauseStartTime=0;
var breakPauseStopTime=0;

//Control variables for pauses vs stops
var workPause=false;
var breakPause=false;

//Values for the timer itself
var timeFlow=false;
var breakCycle;
var timeLeft;

//The timer
var ticker;

// Create the tray
function createTray() {
  tray = new Tray(path.join(__dirname, 'app/icons/work_iconTemplate.png'))
  timeDisplay = "  " + convertTime(defaultTimeLeft).toString()
  tray.setTitle(timeDisplay)
  tray.on('click', function (event) {
    toggleWindow()
  })  
}

// Create the window
function createWindow() {
  window = new BrowserWindow({
		//Width to height golden ratio makes for a more pleasant-appearing size
        width: 300,
        height: 480,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        'node-integration': false,
        icon: path.join(__dirname, 'app/icons/app_icon.png')
    })
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  window.webContents.openDevTools()
  
  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  });
}

function toggleWindow() {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

function showWindow() {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}

function getWindowPosition() {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  //To create the window at the right place cross-platform we'll fetch the screen dimensions
  //If the tray icon is in the lower half of the screen, we'll show the window upwards
  //Top left is 0,0 and x increases right, y downwards
  var workAreaSize=electron.screen.getPrimaryDisplay().workAreaSize;
  
  var x;
  var y;

  // Center window horizontally below the tray icon
  // We'll be careful to make sure the window isn't outside the screen
  x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  //Subtract this difference from x to adjust x by how much the window is outside of the screen
  if(x+windowBounds.width>workAreaSize.width) x-=x+windowBounds.width-workAreaSize.width;

  // Position window 4 pixels vertically below the tray icon
	if(trayBounds.y<workAreaSize.height/2) //If we're in the upper half of the screen
		y = Math.round(trayBounds.y + trayBounds.height + 3)
	else
		y = Math.round(trayBounds.y - trayBounds.height - 3 - windowBounds.height) //Bottom half

  return {x: x, y: y}
}

// Create the notification popup
function getPopupPosition() {
  const popupBounds = popup.getBounds()
  const trayBounds = tray.getBounds()
  //To create the window at the right place cross-platform we'll fetch the screen dimensions
  //If the tray icon is in the lower half of the screen, we'll show the window upwards
  //Top left is 0,0 and x increases right, y downwards
  var workAreaSize=electron.screen.getPrimaryDisplay().workAreaSize;
  
  var x;
  var y;
  
  // Center window horizontally below the tray icon
  x = Math.round(trayBounds.x + (trayBounds.width / 2) - (popupBounds.width / 2));
  //Subtract this difference from x to adjust x by how much the window is outside of the screen
  x-=x+popupBounds.width-workAreaSize.width;

   // Position window 4 pixels vertically below the tray icon
	if(trayBounds.y<workAreaSize.height/2) //If we're in the upper half of the screen
		y = Math.round(trayBounds.y + trayBounds.height + 3);
	else
		y = Math.round(trayBounds.y - trayBounds.height - 3 - popupBounds.height); //Bottom half
  
  return {x: x, y: y}
}

function createPopup() {
  popup = new BrowserWindow({
        width: 200,
        height: 50,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        'node-integration': false,
        alwaysOnTop: true
    })
  popup.loadURL(url.format({
    pathname: path.join(__dirname, 'app/popup.html'),
    protocol: 'file:',
    slashes: true
  }))
  
  // Open the DevTools.
  //popup.webContents.openDevTools()

  // Hide the window when it loses focus
  popup.on('blur', () => {
    if (!popup.webContents.isDevToolsOpened()) {
      popup.hide()
    }
  })
}

function showPopup(type, dissolve) {
  const position = getPopupPosition()
  popup.setPosition(position.x, position.y, false)
  if (type == 'work') {
	  popup.webContents.send('popupMessage', {popup: store.get('workNotification')}, type);
  } else if (type == 'break') {
	  popup.webContents.send('popupMessage', {popup: store.get('breakNotification')}, type);
  }
  popup.showInactive()
  if (dissolve) {
  	setTimeout(function() { popup.hide() }, 5000);
  }
}


// Get our user data, if empty initialize it
const store = new Store({
  // We'll call our data file 'user-data'
  configName: 'user-data',
  getupData: {
    // 25mins is the default cycle
	defaultTimeLeft: 1500,
    // 5mins is the default break time
	defaultBreakTime: 300,
  allowNotifications: true,
  allowSounds: true,
  breakNotification: 'Have a break!',
  workNotification: 'Back to work!'
  }	
});

// Initialize default values of the timer
function initializeDefaults() {
	//Default work time
	defaultTimeLeft = store.get('defaultTimeLeft');
	setTimeLeft(defaultTimeLeft)
	//Default break time
	defaultBreakTime = store.get('defaultBreakTime');
	setBreakTime(defaultBreakTime)
	//First cycle is the work cycle
	setBreak(false);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initializeDefaults)
app.on('ready', startTimer)
app.on('ready', createTray)
app.on('ready', createWindow)
app.on('ready', createPopup)

/**
 * 
 * GetUp timer functions
 *
 */
 
//Function to start the whole thing
function startTimer()
{
// Create the ticker
ticker = new AdjustingInterval(doWork, 1000, doError);
// Start the timer
ticker.start();
//We have to create the work start on the first start to make sure the app starts logging properly
workStartTime=new Date();
}
 
//Setter for the time left
function setTimeLeft(seconds) {
	timeLeft = seconds
}

//Setter for the break time
function setBreakTime(seconds) {
	breakTime = seconds
}

//Seconds into mins:secs converter
function convertTime (seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = seconds - minutes * 60;
	//Padding one-digit numbers with a zero
	if (seconds < 10) { seconds = "0" + seconds };
	return minutes + ":" + seconds;
}

/**
 * Set if timer is on or off
 * @param	{bool}	flag	true for ticking time, false for stopped
 */
function setFlow(flag) {
   timeFlow = flag;
}

/**
 * Set if it's work or break cycle
 * @param	{bool}	flag	true for a break, false for work cycle  
 */
function setBreak(flag) {
   breakCycle = flag;
}

/**
 * Updates the text shown on the tray
 * @param {int} seconds  Amount of time to be displayed
 */
function updateTray(seconds, icon) {
	timeDisplay = "  " + convertTime(seconds).toString()
	tray.setTitle(timeDisplay)
	if (icon == 'breakicon') {
		tray.setImage(path.join(__dirname, 'app/icons/break_iconTemplate.png'))
	} else if (icon == 'workicon') {
		tray.setImage(path.join(__dirname, 'app/icons/work_iconTemplate.png'))
	}
}

//Timer function which takes the system time as reference
function AdjustingInterval(workFunc, interval, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
        setFlow(true);
    }

    this.stop = function() {
        clearTimeout(timeout);
        setFlow(false);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            // You could have some default stuff here too...
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
    }
}

// Define the work to be done
var doWork = function() {	
	//Work cycle hits zero and break should start
	if (timeLeft == 0 && !breakCycle) {
		setBreak(true)
		//Write break start time. Write work stop time. 
		breakStartTime=new Date();
		workStopTime=breakStartTime;
		//If we started work before stopping it, thus have both dates
		if(workStartTime!=0)
			insertEvent(appCalendarId, workStartTime, workStopTime, "Work cycle", oAuth2Client);
		setTimeLeft(defaultTimeLeft)
		updateTray(breakTime, 'breakicon')
		//Update the stats with +1 cycle
		logCycle();
    if (store.get('allowNotifications') == true) {
      showPopup('break', true)
    }
	}
	//Break cycle hits zero and work should start
	else if (breakCycle && breakTime == 0) {
		setBreak(false)
		//Write break stop time. Write work start time.
		breakStopTime=new Date();
		workStartTime=breakStopTime;
		if(breakStartTime!=0)
			insertEvent(appCalendarId, breakStartTime, breakStopTime, "Break cycle", oAuth2Client);
		setBreakTime(defaultBreakTime)
		updateTray(timeLeft, 'workicon')
    if (store.get('allowNotifications') == true) {
      showPopup('work', true)
    }
	}
	//Inside the break cycle
	else if (breakCycle) {
		updateTray(--breakTime)
		if(window!=undefined)
		{
			window.webContents.send('timeUpdate', breakTime);
		}
	}
	//Inside the work cycle
	else {
		updateTray(--timeLeft)
		if(window!=undefined)
		{
			window.webContents.send('timeUpdate', timeLeft);
		}
	}
};

// Define what to do if something goes wrong
var doError = function() {
    console.warn('The drift exceeded the interval.');
};

/**
 * 
 * App button controllers
 *
 */
 
ipcMain.on('getData',
function(event)
{
	window.webContents.send('init', {workDuration: defaultTimeLeft, exerciseDuration: defaultBreakTime, remainingDuration: timeLeft});
}
);
 
ipcMain.on('exerciseUp', 
function(event)
{
	//Increase exercise time by 1 minute
	defaultBreakTime+=60;
	store.set('defaultBreakTime', defaultBreakTime);
	window.webContents.send('exercise', defaultBreakTime);
});

ipcMain.on('exerciseDown', 
function(event)
{
	//Decrease exercise time by 1 minute
	defaultBreakTime-=60;
	store.set('defaultBreakTime', defaultBreakTime);
	window.webContents.send('exercise', defaultBreakTime);
});

ipcMain.on('workUp', 
function(event)
{
	//Increase work time by 1 minute
	defaultTimeLeft+=60;
	store.set('defaultTimeLeft', defaultTimeLeft);
	window.webContents.send('work', defaultTimeLeft);
}); 

ipcMain.on('workDown', 
function(event)
{
	//Increase work time by 1 minute
	defaultTimeLeft-=60;
	store.set('defaultTimeLeft', defaultTimeLeft);
	window.webContents.send('work', defaultTimeLeft);
});  
 
ipcMain.on('timerPause', function (event) {
  if(timeFlow) {
  	ticker.stop();
	//If we were working
	if(!breakCycle)
	{
		workPauseStartTime=new Date();
		workPause=true;
	}
	if(breakCycle)
	{
		breakPauseStartTime=new Date();
		breakPause=true;
	}
  	console.log('Timer paused.');
  } else {
	console.log('Timer is already off.');
  }
})

ipcMain.on('timerResume', function (event) {
  if(!timeFlow) {
  	ticker.start();
	//If we paused the timer
	if(breakPause)
	{
		//A pause in our break
		breakPauseStopTime=new Date();
		insertEvent(appCalendarId, breakPauseStartTime, breakPauseStopTime, "Break cycle paused by user", oAuth2Client);
		breakPause=false;
	}
	else if(workPause)
	{
		workPauseStopTime=new Date();
		insertEvent(appCalendarId, workPauseStartTime, workPauseStopTime, "Work cycle paused by user", oAuth2Client);
		workPause=false;
	}
	else
	{
		//If we didn't pause the timer, we stopped it so we set the start date as a new date
		if(breakCycle)
			breakStartTime=new Date();
		else
			workStartTime=new Date();
	}
  	console.log('Timer resumed.');
  } else {
	console.log('Timer is already on.');
  }
})

ipcMain.on('timerStop', function (event) {
	ticker.stop();
	initializeDefaults();
	updateTray(timeLeft);
	window.webContents.send('timeUpdate', timeLeft);
	//Set the break and work cycles as having been stopped
	if(breakCycle)
	{
		breakStopTime=new Date();
		insertEvent(appCalendarId, breakStartTime, breakStopTime, "Break cycle stopped by user", oAuth2Client);
	}
	else
	{
		workStopTime=new Date();
		insertEvent(appCalendarId, workStartTime, workStopTime, "Work cycle stopped by user", oAuth2Client);
	}
	console.log('Timer stopped.');
})

ipcMain.on('timerQuit', function (event) {
	//Write the token to file before quitting
	writeTokenToFile();
	//Now you can quit!
	app.quit();
})

ipcMain.on('getSettings', function (event) {
  window.webContents.send('notificationsCHeckbox_fromJson', store.get('allowNotifications'));
  window.webContents.send('soundsCheckbox_fromJson', store.get('allowSounds'));
  window.webContents.send('breakNotification_fromJson', store.get('breakNotification'));
  window.webContents.send('workNotification_fromJson', store.get('workNotification'));
  window.webContents.send('calendarCheckbox_fromJson', store.get('gFeatures'));
  gFeatures=store.get('gFeatures');
  readTokenFromFile();
})

ipcMain.on('saveNotificationsChekbox', function (event, value) {
  store.set('allowNotifications', value);
})

ipcMain.on('saveSoundsChekbox', function (event, value) {
  store.set('allowSounds', value);
})

ipcMain.on('saveCustomWorkNotification', function (event, value) {
  store.set('workNotification', value);
})

ipcMain.on('saveCustomBreakNotification', function (event, value) {
  store.set('breakNotification', value);
})


/* Currently not used
ipcMain.on('show-window', () => {
  showWindow()
})
*/


/**
 * 
 * Saving, sending data and stats
 *
 */
 
//Var used to check if today has been initialized or not
var newDay=true;
//Only generate today's date once
var today=new Date();
today=today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
//Store the length of the arrays and the cycle count so we don't have to check every time
//Saves us the file lookup
var statObj=
{
	totalCycles: 0
}

//Initialize the day
function initDay()
{
	//Check if today's date exists
	var stats=store.get('stats['+today+']');
	if(stats===undefined)
		store.set('stats['+today+']', statObj);
	else
	{
		//If it's not a new day, it's a new start so we need to retrieve some dataž
		statObj=stats;
	}
	newDay=false;
}

//Log a new cycle
function logCycle()
{
	if(newDay)
		initDay();
	store.set('stats['+today+'].totalCycles',++statObj.totalCycles);
}

ipcMain.on('loadChart',
function(event)
{
	var data=new Array();
	var labels=new Array();
	//Showing data for the last 7 days
	for(var i=0;i<7;i++)
	{
		//Get current Date
		var day=new Date();
		//Get UTC timestamp and decrement by i days (24 hours*60 minutes*60seconds*1000 milis)
		day=day.getTime()-(i*24*60*60*1000);
		//Generate new day from UTC timestamp
		day=new Date(day);
		//Get yyyy-MM-dd format from the day
		day=day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
		labels[i]=day;
		var daystore=store.get('stats['+day+']');
		if(daystore!=undefined)
			data[i]=store.get('stats['+day+']').totalCycles;
		else
			data[i]=0;
	}
	window.webContents.send('chartData', {data: data, labels: labels});
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window === null) {
    createWindow()
  }
})

//Google Oauth stuff
//Google API
const {google}=require('googleapis');
//Application clientID and Secret
const clientID="387051979739-move84qcjpbu0h7duob5ik4e7ahoe5eh.apps.googleusercontent.com";
const clientSecret="1NyV39SkejkUNa3RM2qIv8Ai";
const oAuth2Client=new google.auth.OAuth2(clientID,clientSecret,"urn:ietf:wg:oauth:2.0:oob");
const scopes=["https://www.googleapis.com/auth/calendar"];
//Checked for google features being enabled
var gFeatures=false;
//The name we will always use for our calendar
var appCalendarName="getuppAppActivityCalendar";
//The ID of the calendar we created! This must get populated on launch
var appCalendarId=null;

//Electron Google OAuth window stuff
const electronGoogleOauth = require('electron-google-oauth');

const browserWindowParams=
{
	useContentSize: true,
	skipTaskbar: true,
	autoHideMenuBar: true,
	center: true,
	show: true,
	resizable: false,
	webPreferences:
	{
		'node-integration':false
	}
};

//Read the token from the file
function readTokenFromFile()
{
	var token=store.get('OAuth2Token');
	if (token!=undefined)
	{
		//Parse the token JSON and set the credentials
		oAuth2Client.setCredentials(token);
		//Hide the login button
		window.webContents.send('hideLogin');
		//Enable the calendar checkbox
		window.webContents.send('enableCalendarCheckbox');
		//Just as a test I'll run checkCalendar here
		checkCalendar(oAuth2Client);
	}
}
//Enables Google calendar if the tick on the settings menu is set
ipcMain.on('saveCalendarCheckbox', function(event,data){
	if(data==true)
	{
		store.set('gFeatures', true);
		gFeatures=true;
	}
	else
	{
		store.set('gFeatures', false);
		gFeatures=false;
	}	
});


//Writes the token to the file
function writeTokenToFile()
{
	console.log("Write Token to File!");
	if(oAuth2Client.credentials!=undefined)
		store.set('OAuth2Token', oAuth2Client.credentials);
}

//This happens when the Google Login button is pressed
ipcMain.on('google-Oauth', 
function(event)
{
	//Create the window
	const googleOauth=electronGoogleOauth(browserWindowParams);
	//Get the access token
	googleOauth.getAccessToken(scopes,clientID,clientSecret).then(
		(result)=>{
			console.log('result',result);
			//Hide the login button and text from the settings
			window.webContents.send('hideLogin');
			//Set the current client credentials
			oAuth2Client.setCredentials(result);
			//Save the token to file
			writeTokenToFile();
			//Enable the calendar checkbox
			window.webContents.send('enableCalendarCheckbox');
			}
		);				
});

function insertEvent(calendarId, startEvent, endEvent, nameEvent, auth)
{
	startEvent=startEvent.toISOString();
	endEvent=endEvent.toISOString();
	if(!gFeatures) return;
	console.log("G features enabled! Writing event to calendar!")
	const calendar=google.calendar({version: 'v3', auth});
	calendar.events.insert({
		calendarId: appCalendarId,
		resource: {
			start: { dateTime: startEvent },
			end: { dateTime: endEvent },
			summary: nameEvent
		}
	},(err, {data})=>{
		if(err) return console.log("Failed to create event due to error: " + err);
		console.log("Event " +nameEvent+" created!");
	});
}

function checkCalendar(auth)
{
	//Exit if gFeatures aren't enabled. 
	if(!gFeatures) return;
	console.log("G features enabled! Checking calendars...");
	//Run the whole calendar stuff. There really is a lot going on here
	const calendar=google.calendar({version: 'v3', auth});
	calendar.calendarList.list({
		maxResults:100
		},(err,{data})=>{
			if(err) return console.log("Failed to retrieve calendar list due to error: " + err);
			const calendars=data.items;
			if(calendars.length)
			{
				console.log("Retrieved " + calendars.length + " calendars");
				//Go through the calendars
				var found=false;
				console.log("Checking calendar names...")
				for(var i=0;i<calendars.length;i++)
				{
					console.log(calendars[i].id);
					if(calendars[i].summary==appCalendarName)
					{
						found=true;
						console.log("Found calendar " + calendars[i].summary + " with ID " + calendars[i].id);
						appCalendarId=calendars[i].id;
						break;
					}
				}
				//If we haven't found our calendar, we must crate one
				if(!found)
				{
					console.log("App calendar not found! Creating...");
					calendar.calendars.insert({
						resource: {summary: appCalendarName}
						},(err,{data})=>{
							if(err) return console.log("Failed to create new calendar due to error: " + err);
							console.log("Created new calendar with name" + data.summary + " and ID " + data.id + "!");
							appCalendarId=data.id;
						});
				}
			}
			else
			{
				console.log("No calendars retrieved!");
				console.log("Creating app calendar...")
				calendar.calendars.insert({
						resource: {summary: appCalendarName}
						},(err,{data})=>{
							if(err) return console.log("Failed to create new calendar due to error: " + err);
							console.log("Created new calendar with name" + data.summary + " and ID " + data.id + "!");
							appCalendarId=data.id;
						});
			}
				
		});
}

