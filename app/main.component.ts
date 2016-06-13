import {Component, Input} from "@angular/core";

import {PlayerComponent} from "./player.component";
import {RootListComponent} from "./root-list.component";
import {SearchingTaskComponent} from "./searching-task.component";

@Component({
    selector: "yap-main",
    template: `<div>
                <yap-player [focusSetting]="focusSetting"> </yap-player>
                <yap-searching></yap-searching>
                <yap-root-list [focusSetting]="focusSetting" > </yap-root-list>
               </div>`,
    directives: [PlayerComponent, RootListComponent, SearchingTaskComponent]
})
export class MainComponent {
    @Input()
    focusSetting: boolean;
}