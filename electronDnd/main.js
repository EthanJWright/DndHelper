const {app, BrowserWindow} = require('electron');


function createWindow () {
    win = new BrowserWindow({width: 700, height: 800});
    win.loadFile('index.html');
}


app.on('ready', createWindow);
