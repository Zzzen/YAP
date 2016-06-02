import {BrowserWindow, dialog} from "electron";
import {SUPPORTED_FORMAT} from "../app/config";

export let template: Electron.MenuItemOptions[] = [
    {
        label: "Open",
        submenu: [
            {
                label: "File",
                accelerator: "CmdOrCtrl+O",
                click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
                    const options = { filters: [{ name: "视频文件", extensions: SUPPORTED_FORMAT }] };
                    dialog.showOpenDialog(options, (filenames) => {
                        if (filenames) {
                            focusedWindow.webContents.send("openVideo", filenames[0]);
                        }
                    });
                }
            }, {
                label: "Directory",
                accelerator: "CmdOrCtrl+Shift+O",
                click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
                    const options: Electron.OpenDialogOptions = { properties: ["openDirectory"] };
                    dialog.showOpenDialog(options, (dirnames) => {
                        if (dirnames) {
                            focusedWindow.webContents.send("openDir", dirnames[0]);
                        }
                    });
                }
            }]
    },
    {
        label: "View",
        submenu: [
            {
                label: "Reload",
                accelerator: "CmdOrCtrl+R",
                click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
                    if (focusedWindow) {
                        // on reload, start fresh and close any old
                        // open secondary windows
                        if (focusedWindow.id === 1) {
                            BrowserWindow.getAllWindows().forEach(function (win) {
                                if (win.id > 1) {
                                    win.close();
                                }
                            });
                        }
                        focusedWindow.reload();
                    }
                }
            },
            {
                label: "Toggle Full Screen",
                accelerator: process.platform === "darwin" ? "Ctrl+Command+F" : "F11",
                click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                }
            },
            {
                label: "Toggle Developer Tools",
                accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
                click: (item: Electron.MenuItem, focusedWindow: Electron.BrowserWindow) => {
                    if (focusedWindow) {
                        focusedWindow.webContents.toggleDevTools();
                    }
                }
            }]
    }, {
        label: "Window",
        role: "window",
        submenu: [
            {
                label: "Minimize",
                accelerator: "CmdOrCtrl+M",
                role: "minimize"
            }, {
                label: "Close",
                accelerator: "CmdOrCtrl+W",
                role: "close"
            }]
    }];

