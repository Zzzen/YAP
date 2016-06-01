import {Component, OnInit} from "@angular/core";
// import {remote} from "electron";

import {TreeviewItemComponent} from "./treeview-item.component";
import {Video, VideoList, Preference} from "./models";
import {VideoService} from "./video.service";
import {PlayerComponent} from "./player.component";
import {PreferenceService} from "./preference.service";

@Component({
    selector: "yap-root-list",
    templateUrl: "./root-list.component.html",
    directives: [TreeviewItemComponent, PlayerComponent],
    providers: [VideoService, PreferenceService]
})
export class RootListComponent implements OnInit {
    data = [] as (Video | VideoList)[];
    isShown = true;

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
        if (this.forceQuit) {
            event.returnValue = true;
        } else {
            this.forceQuit = true;
            event.preventDefault();

            // remote.getCurrentWindow().hide();

            try {
                await this.videoService.saveData();
                await this.preferenceService.writePreference();
            } finally {
                window.close();
            }
        }
    };

    ngOnInit() {
        this.getData();

        const element = document.getElementById("rootList");

        window.onmouseup = () => this.stopDragging();

        window.onbeforeunload = event => { this.onWindowClose(event); };

        window.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                this.preference.widthOfPlayList -= event.movementX;
            }
            this.isShown = this.isDragging ||
                (this.isShown && window.innerWidth - event.clientX - 30 < element.offsetWidth) ||
                (window.innerWidth - event.clientX - 30 < element.offsetWidth && event.clientY < 0.8 * window.innerHeight);
        });
    }

    constructor(private videoService: VideoService, private preferenceService: PreferenceService) {
        this.preference = preferenceService.preference;
    }

    getData() {
        this.videoService.getData().then(data => {
            this.data = data;
        });
    }

}
