import {Component} from "@angular/core";

import {VideoService} from "./video.service";

@Component({
    selector: "yap-searching",
    templateUrl: "./searching-task.component.html"
})
export class SearchingTaskComponent {
    constructor(private videoService: VideoService) {
    }
}