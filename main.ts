import {app, BrowserWindow, Menu} from "electron";

import {template as menuTemplate} from "./scripts/menuTemplate";

let mainWindow: Electron.BrowserWindow = undefined;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    mainWindow.loadURL("file://" + __dirname + "/views/index.html");

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = undefined;
    });
}

app.on("ready", () => {
    createWindow();
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!mainWindow) {
        createWindow();
    }
});
