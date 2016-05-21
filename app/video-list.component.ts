import {Component, Input, forwardRef} from "@angular/core";

import {VideoList} from "./models";
import {TreeviewItemComponent}  from "./treeview-item.component";

@Component({
    selector: "yap-video-list",
    template: `
        <ul class="yap-video-list">
            <span> {{videoList.name}} </span>
            <yap-item *ngFor="let x of videoList.videos" [data]="x"> </yap-item>
        </ul>
    `,
    directives: [forwardRef(() => TreeviewItemComponent)]
})
export class VideoListComponent {
    @Input()
    videoList: VideoList;
}
