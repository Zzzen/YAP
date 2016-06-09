import {Component, OnInit, Input} from "@angular/core";
// import {remote} from "electron";

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
    data = [] as (Video | VideoList)[];
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
        if (this.forceQuit) {
            event.returnValue = true;
        } else {
            this.forceQuit = true;
            event.preventDefault();

            // remote.getCurrentWindow().hide();

            try {
                // doesn't work?

                // await this.videoService.saveData();
                // await this.preferenceService.writePreference();

                await Promise.all([this.videoService.saveData(), this.preferenceService.writePreference()]);

                window.close();
            } catch (err) {
                console.log(err);
            } finally {
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
                (window.innerWidth - event.clientX - 30 < element.offsetWidth && event.clientY < 0.4 * window.innerHeight);
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

    getRgbaString() {
        const [r, g, b] = this.preferenceService.preference.backgroundColorOfPlaylist.match(/[^#]{2}/g).map(x => Number.parseInt(x, 16));
        const a = this.preferenceService.preference.backgroundOpacityOfPlaylist;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
}
