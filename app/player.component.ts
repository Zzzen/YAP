import {Component, ElementRef, OnInit, OnDestroy} from "@angular/core";

import {VideoService} from "./video.service";
import {Video} from "./models";

const wcjs: any = require("wcjs-player");

@Component({
    selector: "yap-player",
    template: `
        <div id="player"> </div>
    `
})
export class PlayerComponent implements OnInit, OnDestroy {
    // rawPlayer: HTMLVideoElement;

    subscription: any;

    player: any;

    private currentVideo: Video;

    constructor(
        private element: ElementRef,
        private videoService: VideoService) {
    }

    ngOnInit() {
        this.player = new wcjs("#player").addPlayer({ autoplay: true });
        this.player.onTime((time: number) => this.onTimeUpdate(time));

        this.subscription = this.videoService.playingChange.subscribe((video: Video) => { this.playVideo(video); });
    }

    playVideo(video: Video) {
        if (video === this.currentVideo) {
            return;
        } else {
            const url = "file:///" + video.fullpath.replace(/\\/g, "/");
            this.currentVideo = video;

            this.player.vlc.play(url);
            this.player.time(video.position);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    onTimeUpdate(milliseconds: number) {
        if (this.currentVideo) {
            this.currentVideo.position = milliseconds;
        }
    }
}
