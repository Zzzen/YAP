import {Component, Input} from "@angular/core";

import {Video} from "./models";
import {VideoService} from "./video.service";

@Component({
    selector: "yap-video",
    template: `
        <div class="yap-video">
            <a (click)="play()"> {{getFilename(video.fullpath)}} </a>
            <button (click)="onRemove()" class="btn badge" > X </button>  
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

    play() {
        this.videoService.playVideo(this.video);
    }

    getFilename(fullpath: string) {
        const reg = /([^\/\\]+)$/;
        return reg.exec(fullpath)[0];
    }
}
