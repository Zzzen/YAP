import {Component, Input} from "@angular/core";

import {Video} from "./models";
import {VideoService} from "./video.service";

@Component({
    selector: "yap-video",
    template: `
        <div *ngIf="video">
            <a> {{video.fullpath}} </a>
            <button (click)="onRemove()"> delete me </button>  
        </div>
    `
})
export class VideoComponent {
    @Input()
    video: Video;

    constructor(private videoService: VideoService) {

    }

    onRemove() {
        this.videoService.removeVideo(this.video);
    }
}
