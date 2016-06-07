import {app, BrowserWindow, Menu} from "electron";

import {template as menuTemplate} from "./scripts/menuTemplate";
import {readFileAsString} from "./app/promisifiedNode";
import {Preference} from "./app/models";

let mainWindow: Electron.BrowserWindow = undefined;

async function createWindow() {

    let width = 800;
    let height = 600;
    let maximized = false;

    try {
        const str = await readFileAsString("./preference.json");
        const pref: Preference = JSON.parse(str);
        width = pref.widthOfWindow;
        height = pref.heightOfWindow;
        maximized = pref.maximized;
    } catch (err) {
        console.log(err);
    }

    mainWindow = new BrowserWindow({ width, height });
    if (maximized) { mainWindow.maximize(); }

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
