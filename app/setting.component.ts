import {EventEmitter, Component, Input, Output} from "@angular/core";

import {PreferenceService} from "./preference.service";

@Component({
    selector: "yap-setting",
    templateUrl: "./setting.component.html"
})
export class SettingComponent {
    @Input()
    focusSetting: boolean;

    @Output()
    exit = new EventEmitter<void>();

    constructor(private preferenceService: PreferenceService) {

    }

    onExitClicked() {
        // to do: remove void 0
        this.exit.emit(void 0);
    }

}