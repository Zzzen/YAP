import {Injectable} from "@angular/core";
import {remote} from "electron";

import {readFileAsString, writeStringToFile} from "./promisifiedNode";
import {Preference} from "./models";

@Injectable()
export class PreferenceService {
    // private updateEmitter = new EventEmitter<Preference>();

    preference: Preference = {
        widthOfPlayList: 350,
        widthOfWindow: 800,
        heightOfWindow: 600
    };

    constructor() {
        remote.getCurrentWindow().addListener("resize", () => {
            [this.preference.widthOfWindow, this.preference.heightOfWindow] = remote.getCurrentWindow().getSize();
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

            remote.getCurrentWindow().setSize(this.preference.widthOfWindow, this.preference.heightOfWindow, true);
        } catch (err) {
            console.log("error reading preference: ", err);
        }
    }

    async writePreference() {
        return await writeStringToFile("preference.json", JSON.stringify(this.preference, undefined, 4));
    }
}
