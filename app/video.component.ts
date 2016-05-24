import {Component, Input} from "@angular/core";

import {Video} from "./models";
import {VideoService} from "./video.service";

@Component({
    selector: "yap-video",
    templateUrl: "./video.component.html"
})
export class VideoComponent {
    @Input()
    video: Video;

    constructor(private videoService: VideoService) {

    }

    onRemove() {
        this.videoService.removeVideoOrList(this.video);
    }

    play() {
        this.videoService.playVideo(this.video);
    }

    getFilename(fullpath: string) {
        const reg = /([^\/\\]+)$/;
        return reg.exec(fullpath)[0];
    }
}
