import {Component, OnInit, Input} from "@angular/core";
import {remote} from "electron";

import {TreeviewItemComponent} from "./treeview-item.component";
import {Video, VideoList, Preference} from "./models";
import {VideoService} from "./video.service";
import {PreferenceService} from "./preference.service";

@Component({
    selector: "yap-root-list",
    templateUrl: "./root-list.component.html",
    directives: [TreeviewItemComponent]
})
export class RootListComponent implements OnInit {
    data: (Video | VideoList)[];
    isShown = true;

    @Input()
    focusSetting: boolean;

    isDragging = false;

    forceQuit = false;

    preference: Preference;

    isVideoList(arg: any): arg is VideoList {
        return !!arg.videos;
    }

    startDragging() {
        this.isDragging = true;
    }

    stopDragging() {
        this.isDragging = false;
    }

    async onWindowClose(event: BeforeUnloadEvent) {
        if (!this.forceQuit) {
            // prevent window from closing
            event.returnValue = false;

            remote.getCurrentWindow().hide();

            try {
                await Promise.all([this.videoService.saveData(), this.preferenceService.writePreference()]);
            } catch (err) {
                console.log(err);
            } finally {
                this.forceQuit = true;
                remote.getCurrentWindow().close();
            }
        }
    };

    ngOnInit() {
        const element = document.getElementById("rootList");

        window.onmouseup = () => this.stopDragging();

        window.onbeforeunload = event => { this.onWindowClose(event); };

        window.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                this.preference.widthOfPlayList -= event.movementX;
            }
            this.isShown = this.isDragging ||
                (this.isShown && window.innerWidth - event.clientX - 30 < element.offsetWidth) ||
                (window.innerWidth - event.clientX - 30 < element.offsetWidth && event.clientY < 0.4 * window.innerHeight);
        });
    }

    constructor(private videoService: VideoService, private preferenceService: PreferenceService) {
        this.data = videoService.data;
        this.preference = preferenceService.preference;
    }

    getRgbaString() {
        const [r, g, b] = this.preferenceService.preference.backgroundColorOfPlaylist.match(/[^#]{2}/g).map(x => Number.parseInt(x, 16));
        const a = this.preferenceService.preference.backgroundOpacityOfPlaylist;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
}
