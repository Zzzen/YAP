import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {remote} from "electron";
import $ = require("jquery");

import {VideoService} from "./video.service";
import {PreferenceService} from "./preference.service";
import {Video} from "./models";

const wcjs: any = require("wcjs-player");

@Component({
    selector: "yap-player",
    template: `
        <div id="player" [class.isHidden]="focusSetting" > </div>
    `
})
export class PlayerComponent implements OnInit, OnDestroy {
    // rawPlayer: HTMLVideoElement;

    @Input()
    focusSetting: boolean;

    subscription: any;

    player: any;

    private currentVideo: Video;

    constructor(
        private element: ElementRef,
        private videoService: VideoService,
        private preferenceService: PreferenceService) {
    }

    private initKeyboardListener() {
        // to do, use wcp-surface?
        document.addEventListener("keydown", event => {
            let accepted = true;

            switch (event.key) {
                case "Escape":
                    if (remote.getCurrentWindow().isFullScreen()) {
                        remote.getCurrentWindow().setFullScreen(false);
                    }
                    break;

                case " ":
                    this.player.togglePause();
                    break;

                case "ArrowLeft":
                    this.player.time(this.player.time() - 5000);
                    break;

                case "ArrowRight":
                    this.player.time(this.player.time() + 5000);
                    break;

                case "ArrowUp":
                    this.player.volume(this.player.volume() + 10);
                    break;

                case "ArrowDown":
                    this.player.volume(this.player.volume() - 10);
                    break;

                default:
                    accepted = false;
                    break;
            }

            if (accepted) {
                event.preventDefault();
            }

        }, true);
    }

    ngOnInit() {
        this.initKeyboardListener();

        this.initPlayer();

        this.player.onEnded(() => {
            this.currentVideo.position = 0;

            const next = this.videoService.getNearbyVideos(this.currentVideo).next;
            if (next) { this.playVideo(next); }
        });

        this.player.onTime((time: number) => this.onTimeUpdate(time));

        this.subscription = this.videoService.playingChange.subscribe((video: Video) => { this.playVideo(video); });
    }

    private initPlayer() {
        this.player = new wcjs("#player").addPlayer({
            autoplay: true,
            wcjs: require("wcjs-prebuilt")
        });

        const $wcpSurface = $(".wcp-surface");
        $wcpSurface[0].addEventListener("wheel", event => {
            const before: number = this.player.volume();
            const after: number = before + 10 * (event.deltaY > 0 ? -1 : 1);

            this.player.volume(after);
        });

        this.preferenceService.updateEmitter.subscribe(() => {
            this.player.volume(this.preferenceService.preference.volume);
        });

        this.player.onVolume((newValue: number) => {
            this.preferenceService.preference.volume = newValue;
        });

        // toggle fullscreen when dblclick
        $wcpSurface.unbind("dblclick");
        $wcpSurface.dblclick(event => {
            $(".wcp-anim-basic").finish();
            $(".wcp-pause-anim").finish();

            const isFullScreen = remote.getCurrentWindow().isFullScreen();
            remote.getCurrentWindow().setFullScreen(!isFullScreen);
            if (isFullScreen) {
                $(".wcp-minimize").removeClass("wcp-minimize").addClass("wcp-maximize");
            } else {
                $(".wcp-maximize").removeClass("wcp-maximize").addClass("wcp-minimize");
            }
        });

        function hideTitle() { $(".wcp-titlebar").fadeOut("slow"); }

        let timerId = window.setTimeout(hideTitle, 3000);
        $wcpSurface.unbind("mousemove");
        const $titleBar = $(".wcp-titlebar");
        $wcpSurface.mousemove(event => {
            window.clearTimeout(timerId);
            timerId = window.setTimeout(hideTitle, 3000);

            if (!$titleBar.is(":visible")) {
                $titleBar.fadeIn("slow");
            }
        });

    }

    playVideo(video: Video) {
        if (video === this.currentVideo) {
            return;
        } else {
            this.currentVideo = video;

            this.player.vlc.play(video.fullpath);
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
