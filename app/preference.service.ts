import {Injectable, EventEmitter} from "@angular/core";
import {remote} from "electron";

import {readFileAsString, writeStringToFile} from "./promisifiedNode";
import {Preference} from "./models";

@Injectable()
export class PreferenceService {

    static DEFAULT_PREFERENCE: Preference = {
        widthOfPlayList: 350,
        widthOfWindow: 800,
        heightOfWindow: 600,
        maximized: false,
        volume: 100,
        backgroundColorOfPlaylist: "#e0922b",
        backgroundOpacityOfPlaylist: 0.8,
        fontSize: 15,
        fontColor: "#337ab7"
    };

    updateEmitter = new EventEmitter<Preference>();

    preference: Preference = Object.assign({}, PreferenceService.DEFAULT_PREFERENCE);

    constructor() {
        const currentWindow = remote.getCurrentWindow();

        currentWindow.addListener("resize", () => {
            [this.preference.widthOfWindow, this.preference.heightOfWindow] = remote.getCurrentWindow().getSize();
        });

        currentWindow.addListener("maximize", () => {
            this.preference.maximized = true;
        });

        currentWindow.addListener("unmaximize", () => {
            this.preference.maximized = false;
        });

        this.readPreference();
    }
    // todo: I don't like it
    // read config from file and set size of window
    async readPreference() {
        try {
            const str = await readFileAsString("preference.json");
            const read = JSON.parse(str) as Preference;
            Object.assign(this.preference, read);

            this.updateEmitter.emit(this.preference);
        } catch (err) {
            console.log("error reading preference: ", err);
        }
    }

    async writePreference() {
        return writeStringToFile("preference.json", JSON.stringify(this.preference, undefined, 4));
    }

    resetPreference() {
        this.preference = Object.assign({}, PreferenceService.DEFAULT_PREFERENCE);
    }
}