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

// Create the tray
function createTray() {
  tray = new Tray(path.join(__dirname, 'app/icons/work_icon.png'))
  timeDisplay = convertTime(defaultTimeLeft).toString()
  tray.setTitle(timeDisplay)
  tray.on('click', function (event) {
    toggleWindow()
  })  
}

// Create the window
function createWindow() {
  window = new BrowserWindow({
        width: 350,
        height: 450,
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
  //window.webContents.openDevTools()

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
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
  x-=x+windowBounds.width-workAreaSize.width;

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
        height: 100,
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
	  popup.webContents.send('popupMessage', {popup:'Back to work!'});
  } else if (type == 'break') {
	  popup.webContents.send('popupMessage', {popup:'Have a break!'});
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
	defaultBreakTime: 300
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
	//Default cycle to start
	setBreak(false)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', initializeDefaults)
app.on('ready', createTray)
app.on('ready', createWindow)
app.on('ready', createPopup)

/**
 * 
 * GetUp timer functions
 *
 */

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
	timeDisplay = convertTime(seconds).toString()
	tray.setTitle(timeDisplay)
	if (icon == 'breakicon') {
		tray.setImage(path.join(__dirname, 'app/icons/break_icon.png'))
	} else if (icon == 'workicon') {
		tray.setImage(path.join(__dirname, 'app/icons/work_icon.png'))
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
		setTimeLeft(defaultTimeLeft)
		updateTray(breakTime, 'breakicon')
		//Update the stats with +1 cycle
		saveCycleData()
		showPopup('break', true)
	}
	//Break cycle hits zero and work should start
	else if (breakCycle && breakTime == 0) {
		setBreak(false)
		setBreakTime(defaultBreakTime)
		updateTray(timeLeft, 'workicon')
		showPopup('work', true)
	}
	//Inside the break cycle
	else if (breakCycle) {
		updateTray(--breakTime)
	}
	//Inside the work cycle
	else {
		updateTray(--timeLeft)
	}
	//Send data to the renderer
	createStats();	
};

// Define what to do if something goes wrong
var doError = function() {
    console.warn('The drift exceeded the interval.');
};

// (The third argument is optional)
var ticker = new AdjustingInterval(doWork, 1000, doError);

// Start the timer on launch
ticker.start();


/**
 * 
 * App button controllers
 *
 */
ipcMain.on('timerPause', function (event) {
  if(timeFlow) {
  	ticker.stop();
  	console.log('Timer paused.');
  } else {
	console.log('Timer is already off.');
  }
})

ipcMain.on('timerResume', function (event) {
  if(!timeFlow) {
  	ticker.start();
  	console.log('Timer resumed.');
  } else {
	console.log('Timer is already on.');
  }
})

ipcMain.on('timerStop', function (event) {
	ticker.stop();
	initializeDefaults();
	updateTray(timeLeft)
	console.log('Timer stopped.');
})

ipcMain.on('saveSettings', function (event, defaultTimeLeft) {
	defaultTimeLeft = defaultTimeLeft * 60;
	store.set('defaultTimeLeft', defaultTimeLeft);
	console.log('Work time setting is set to ' + defaultTimeLeft + ' seconds');
})

ipcMain.on('timerQuit', function (event) {
	app.quit();
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
 
//Save cycle data for this day
function saveCycleData() {
	var todaysDate = new Date();
	var todaysDate = todaysDate.getFullYear()+'-'+(todaysDate.getMonth()+1)+'-'+todaysDate.getDate();
	totalCyclesToday = store.get('cycles['+todaysDate+']');
	if (!totalCyclesToday) { totalCyclesToday = 0; }
	store.set('cycles['+todaysDate+']', totalCyclesToday+1);
}

//Send cycle data for this day
function sendCycleData() {
	var todaysDate = new Date();
	var todaysDate = todaysDate.getFullYear()+'-'+(todaysDate.getMonth()+1)+'-'+todaysDate.getDate();
	totalCyclesToday = store.get('cycles['+todaysDate+']');
	if (!totalCyclesToday) { totalCyclesToday = 0; }
	window.webContents.send('totalCyclesToday', {cycles:totalCyclesToday});
}

function createStats() {
	//Send the stats to the renderer on initializing
	sendCycleData();
}


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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
