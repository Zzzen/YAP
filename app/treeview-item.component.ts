import {Component, Input} from "@angular/core";

import {VideoComponent} from "./video.component";
import {VideoListComponent} from "./video-list.component";
import {VideoOrVideoList, isVideoList} from "./models";

@Component({
    selector: "yap-item",
    template: `
        <yap-video *ngIf="!isVideoList(data)" [video]="data"> </yap-video>
        <yap-video-list *ngIf="isVideoList(data)" [videoList]="data"> </yap-video-list>
    `,
    directives: [VideoComponent, VideoListComponent]
})
export class TreeviewItemComponent {
    @Input()
    data: VideoOrVideoList;

    isVideoList = isVideoList;
}
