import {Component, Input} from "@angular/core";

import {PlayerComponent} from "./player.component";
import {RootListComponent} from "./root-list.component";

@Component({
    selector: "yap-main",
    template: `<div>
                <yap-player [focusSetting]="focusSetting"> </yap-player>
                <yap-root-list [focusSetting]="focusSetting" > </yap-root-list>
               </div>`,
    directives: [PlayerComponent, RootListComponent]
})
export class MainComponent {
    @Input()
    focusSetting: boolean;
}