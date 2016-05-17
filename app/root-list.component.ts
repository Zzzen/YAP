import {Component, OnInit} from "@angular/core";

import {VideoComponent} from "./video.component";
import {VideoListComponent} from "./video-list.component";
import {Video, VideoList} from "./models";
import {VideoService} from "./video.service";

@Component({
    selector: "yap-root-list",
    template: `
        <div id="rootList">
            <ul>
                <li *ngFor="let x of data">
                    <yap-video *ngIf="!isVideoList(x)" [video]="x"> </yap-video>
                    <yap-video-list *ngIf="isVideoList(x)" [videoList]="x"> </yap-video-list>
                </li>
            </ul>
        </div>
    `,
    directives: [VideoComponent, VideoListComponent],
    providers: [VideoService]
})
export class RootListComponent implements OnInit {
    data = [] as (Video | VideoList)[];


    isVideoList(arg: any): arg is VideoList {
        return !!arg.videos;
    }

    ngOnInit() {
        this.getData();
    }

    constructor(private videoService: VideoService) {
    }

    getData() {
        this.videoService.getData().then(data => {
            this.data = data;
        });
    }

}
