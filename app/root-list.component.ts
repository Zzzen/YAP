import {Component, OnInit} from "@angular/core";
import {remote} from "electron";

import {TreeviewItemComponent} from "./treeview-item.component";
import {Video, VideoList} from "./models";
import {VideoService} from "./video.service";
import {PlayerComponent} from "./player.component";

@Component({
    selector: "yap-root-list",
    templateUrl: "./root-list.component.html",
    directives: [TreeviewItemComponent, PlayerComponent],
    providers: [VideoService]
})
export class RootListComponent implements OnInit {
    data = [] as (Video | VideoList)[];
    isShown = true;

    isDragging = false;

    forceQuit = false;

    width = 350;

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

            event.returnValue = false;
            remote.getCurrentWindow().hide();

            try {
                await this.videoService.saveData();
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

        window.onmousemove = (event) => {
            if (this.isDragging) {
                this.width -= event.movementX;
            }
            this.isShown = this.isDragging ||
                (this.isShown && window.innerWidth - event.clientX - 30 < element.offsetWidth) ||
                (window.innerWidth - event.clientX - 30 < element.offsetWidth && event.clientY < 0.8 * window.innerHeight);
        };
    }

    constructor(private videoService: VideoService) {
    }

    getData() {
        this.videoService.getData().then(data => {
            this.data = data;
        });
    }

}
