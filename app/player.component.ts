import {Component, ElementRef, OnInit, OnDestroy, Input} from "@angular/core";
import {remote} from "electron";
import $ = require("jquery");
import _ = require("lodash");

import {VideoService} from "./video.service";
import {PreferenceService} from "./preference.service";
import {Video} from "./models";

const renderer = require("wcjs-renderer");
const vlc = require("wcjs-prebuilt").createPlayer();

// milliseconds
const DBCLICK_INTERVAL = 360;

// import {stat} from "./promisifiedNode";


// const SUPPORTED_SUBTITLE_FORMAT = ["sub", "srt", "webvtt"];

@Component({
    selector: "yap-player",
    templateUrl: "./player.component.html"
})
export class PlayerComponent implements OnInit, OnDestroy {
    // rawPlayer: HTMLVideoElement;

    @Input()
    focusSetting: boolean;

    subscription: any;

    private currentVideo: Video;

    private currentVideoLength = 0;

    private currentShowedTime = 0;

    private vlcTime = 0;

    private isDraggingTime = false;

    private isPlaying = false;

    private showControls = true;
    private moveTimerId: number = undefined;

    private canvas: HTMLCanvasElement;

    private clickTimerId: number = undefined;

    static toggleFullscreen() {
        const isFullScreen = remote.getCurrentWindow().isFullScreen();
        remote.getCurrentWindow().setFullScreen(!isFullScreen);
    }

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
                    this.togglePause();
                    break;

                case "ArrowLeft":
                    this.currentShowedTime -= 5000;
                    vlc.time -= 5000;
                    break;

                case "ArrowRight":
                    this.currentShowedTime += 5000;
                    vlc.time += 5000;
                    break;

                case "ArrowUp":
                    vlc.volume += 10;
                    break;

                case "ArrowDown":
                    vlc.volume -= 10;
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

    togglePause() {
        vlc.togglePause();
        this.isPlaying = !this.isPlaying;
    }

    onClick() {
        if (undefined !== this.clickTimerId) {
            window.clearTimeout(this.clickTimerId);
            this.clickTimerId = undefined;

            // toggleFullscreen
            const isFullScreen = remote.getCurrentWindow().isFullScreen();
            remote.getCurrentWindow().setFullScreen(!isFullScreen);

        } else {
            this.clickTimerId = window.setTimeout(() => {
                if (this.currentVideo) {
                    this.togglePause();
                }
                this.clickTimerId = undefined;
            }, DBCLICK_INTERVAL);
        }
    }


    ngOnInit() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;

        renderer.bind(this.canvas, vlc);

        document.addEventListener("mousemove", event => {
            if (0 !== event.movementX && 0 !== event.movementY) {
                this.showControls = true;
            }

            if (this.moveTimerId !== undefined) {
                window.clearTimeout(this.moveTimerId);
            }

            this.moveTimerId = window.setTimeout(() => {
                this.moveTimerId = undefined;
                this.showControls = false;
            }, 3000);
        });

        this.initKeyboardListener();

        this.initPlayer();

        this.subscription = this.videoService.playingChange.subscribe((video: Video) => { this.playVideo(video); });
    }

    getTransform() {
        // todo: optimization
        const parent = this.canvas.parentElement;

        const parentHeight = $(parent).height();
        const parentWidth = $(parent).width();

        const canvasHeight = $(this.canvas).height();
        const canvasWidth = $(this.canvas).width();


        const ratio = Math.min(parentWidth / canvasWidth,
            parentHeight / canvasHeight);

        return `translate(-50%, -50%) scale(${ratio})`;
    }

    setVolume(volume: number) {
        vlc.volume = 200 < volume ? 200 : volume;
        this.preferenceService.preference.volume = vlc.volume;
    }

    onWheel($event: WheelEvent) {
        this.setVolume(vlc.volume + 10 * ($event.deltaY > 0 ? -1 : 1));
    }


    logX(s: string) {
        console.log(s);
    }

    onTimeChangedManually($event: Event) {
        // console.log("drag ended");

        // tofix: this may be buggy?
        // since `startDraggingTime($event)` is triggered by focus
        ($event.target as HTMLInputElement).blur();

        this.isDraggingTime = false;

        // vlc.time = parseInt(($event.target as HTMLInputElement).value, 10);
    }

    onTimeClick($event: Event) {
        // console.log("click end");
        this.isDraggingTime = false;
        vlc.time = parseInt(($event.target as HTMLInputElement).value, 10);
    }

    startDraggingTime($event: Event) {
        // console.log("drag start");
        this.isDraggingTime = true;
    }

    stopPropagation($event: Event) {
        $event.stopPropagation();
    }

    private initPlayer() {
        // todo: find a better way
        window.setInterval(() => {
            this.canvas.style.transform = this.getTransform();
        }, 100);

        vlc.onEndReached = () => {
            this.currentVideo.position = 0;

            const next = this.videoService.getNearbyVideos(this.currentVideo).next;
            if (next) {
                this.playVideo(next);
            } else {
                // todo: fix?
                this.currentVideo = undefined;

                // vlc.time = 0;
                // vlc.play();
                // vlc.pause();
            }
        };

        vlc.onTimeChanged = (time: number) => {
            this.vlcTime = time;

            this.currentVideo.position = time;

            if (!this.isDraggingTime) {
                this.currentShowedTime = time;
            }
        };

        vlc.onLengthChanged = (length: number) => {
            this.currentVideoLength = length;
        };


        this.preferenceService.updateEmitter.subscribe(() => {
            vlc.volume = this.preferenceService.preference.volume;
        });

        // function hideTitle() { $(".wcp-titlebar").fadeOut("slow"); }

        // let timerId = window.setTimeout(hideTitle, 3000);
        // $wcpSurface.unbind("mousemove");
        // const $titleBar = $(".wcp-titlebar");
        // $wcpSurface.mousemove(event => {
        //     window.clearTimeout(timerId);
        //     timerId = window.setTimeout(hideTitle, 3000);

        //     if (!$titleBar.is(":visible")) {
        //         $titleBar.fadeIn("slow");
        //     }
        // });

    }

    tryPlayingPrev() {
        const prev = this.videoService.getNearbyVideos(this.currentVideo).prev;
        if (prev) {
            this.playVideo(prev);
        }
    }

    tryPlayingNext() {
        const next = this.videoService.getNearbyVideos(this.currentVideo).next;
        if (next) {
            this.playVideo(next);
        }
    }

    playVideo(video: Video) {
        if (video === this.currentVideo) {
            return;
        } else {
            this.currentVideo = video;
            this.isPlaying = true;

            vlc.play(video.fullpath);
            vlc.time = video.position;


            // todo: support subtitles?

            // this.player.clearPlaylist();

            // (async () => {
            //     const subtitle = await this.findPossibleSubtitles(video.fullpath);

            //     if (subtitle) {
            //         this.player.addPlaylist({
            //             url: video.fullpath,
            //             subtitles: {
            //                 subtitle
            //             }
            //         });
            //     } else {
            //         this.player.addPlaylist({
            //             url: video.fullpath
            //         });
            //     }

            //     this.player.play();
            //     this.player.time(video.position);
            // })();
        }
    }

    // async findPossibleSubtitles(url: string) {
    //     const withoutExtensoin = url.match(/(.+\.)[^.]/)[1].replace("file:///", "");
    //     // console.log(withoutExtensoin);

    //     for (const format of SUPPORTED_SUBTITLE_FORMAT) {
    //         try {
    //             // if it doesn't exist, an exception will be throwed.
    //             await stat(withoutExtensoin + format);
    //             return withoutExtensoin + format;
    //         } catch (err) { }
    //     }

    //     return undefined;
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    formatTime(milliseconds: number) {
        const seconds = milliseconds / 1000;

        const hours = _.padStart(Math.floor(seconds / 3600) + "", 2, "0");
        const hourReminder = seconds % 3600;
        const minutes = _.padStart(Math.floor(hourReminder / 60) + "", 2, "0");
        const minuteReminder = _.padStart(Math.floor(hourReminder % 60) + "", 2, "0");

        return `${hours}:${minutes}:${minuteReminder}`;
    }
}
