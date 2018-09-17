const {app, BrowserWindow} = require('electron');


function createWindow () {
    win = new BrowserWindow({width: 600, height: 800});
    win.loadFile('index.html');
}


app.on('ready', createWindow);
