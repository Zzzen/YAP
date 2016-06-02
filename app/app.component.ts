import {Component} from "@angular/core";
import {ipcRenderer} from "electron";

import {VideoService} from "./video.service";
import {PreferenceService} from "./preference.service";
import {SettingComponent} from "./setting.component";
import {MainComponent} from "./main.component";

@Component({
    selector: "app",
    template: `<yap-setting [focusSetting]="focusSetting" (exit)="focusSetting=false"> </yap-setting>
               <yap-main [focusSetting]="focusSetting"> </yap-main>`,
    directives: [SettingComponent, MainComponent],
    providers: [VideoService, PreferenceService]
})
export class AppComponent {
    focusSetting = false;

    constructor() {
        ipcRenderer.on("openSetting", (event: any) => {
            this.focusSetting = !this.focusSetting;
        });
    }
}