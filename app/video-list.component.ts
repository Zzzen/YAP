import {Component, Input} from "@angular/core";

import {Video, VideoList} from "./models";
import {VideoComponent} from "./video.component";

@Component({
    selector: "yap-video-list",
    template: `
        <ul class="yap-video-list">
            <span> {{videoList.name}} </span>
            <yap-video *ngFor="let x of videoList.videos" [video]="x"> </yap-video>
        </ul>
    `,
    directives: [VideoComponent]
})
export class VideoListComponent {
    @Input()
    videoList: VideoList = {
        name: "",
        videos: [] as Video[]
    };
}
