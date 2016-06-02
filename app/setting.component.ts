import {EventEmitter, Component, Input, Output} from "@angular/core";


@Component({
    selector: "yap-setting",
    templateUrl: "./setting.component.html"
})
export class SettingComponent {
    @Input()
    focusSetting: boolean;

    @Output()
    exit = new EventEmitter<void>();

    onExitClicked() {
        // to do: remove void 0
        this.exit.emit(void 0);
    }
}