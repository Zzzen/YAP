import {Component, OnInit} from "@angular/core";

import {VideoComponent} from "./video.component";
import {VideoListComponent} from "./video-list.component";
import {Video, VideoList} from "./models";
import {VideoService} from "./video.service";
import {PlayerComponent} from "./player.component";

@Component({
    selector: "yap-root-list",
    template: `
        <yap-player> </yap-player>
        <div id="rootList" [class.isShown]="isShown" [style.width.px]="width">
            <div id="handler_vertical" (mousedown)="startDragging()"></div>
            <ul>
                <li *ngFor="let x of data">
                    <yap-video *ngIf="!isVideoList(x)" [video]="x"> </yap-video>
                    <yap-video-list *ngIf="isVideoList(x)" [videoList]="x"> </yap-video-list>
                </li>
            </ul>
        </div>
    `,
    directives: [VideoComponent, VideoListComponent, PlayerComponent],
    providers: [VideoService]
})
export class RootListComponent implements OnInit {
    data = [] as (Video | VideoList)[];
    isShown = true;

    isDragging = false;

    width = 350;

    isVideoList(arg: any): arg is VideoList {
        return !!arg.videos;
    }

    startDragging() {
        this.isDragging = true;
    }

    stopDragging() {
        this.isDragging = false;
    }

    ngOnInit() {
        this.getData();

        const element = document.getElementById("rootList");

        window.onmouseup = () => this.stopDragging();

        window.onmousemove = (event) => {
            if (this.isDragging) {
                this.width -= event.movementX;
            }
            this.isShown = this.isDragging ||
                (window.innerWidth - event.clientX - 30 < element.offsetWidth && event.clientY < 0.8 * window.innerHeight);
        };
    }

    constructor(private videoService: VideoService) {
    }

    getData() {
        this.videoService.getData().then(data => {
            this.data = data;
        });
    }

}
