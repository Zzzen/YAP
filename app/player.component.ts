import {Component, ElementRef, OnInit, OnDestroy} from "@angular/core";

import {VideoService} from "./video.service";
import {Video} from "./models";

@Component({
    selector: "yap-player",
    template: `
        <video controls class="video-js vjs-default-skin" id="player" (timeupdate)="onTimeUpdate()"> </video>
    `
})
export class PlayerComponent implements OnInit, OnDestroy {
    // rawPlayer: HTMLVideoElement;

    subscription: any;

    jsPlayer: VideoJSPlayer;

    private currentVideo: Video;

    constructor(
        private element: ElementRef,
        private videoService: VideoService) {
    }

    ngOnInit() {
        this.jsPlayer = videojs("player");

        this.subscription = this.videoService.playingChange.subscribe((video: Video) => { this.playVideo(video); });
    }

    playVideo(video: Video) {
        if (video === this.currentVideo) {
            return;
        } else {
            const url = "file://" + video.fullpath.replace(/\\/g, "/");
            this.currentVideo = video;
            this.jsPlayer.src(url);
            this.jsPlayer.currentTime(video.position);
            this.jsPlayer.play();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onTimeUpdate() {
        if (this.currentVideo) {
            this.currentVideo.position = this.jsPlayer.currentTime();
        }
    }
}
