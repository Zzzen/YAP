import {Component, Input, forwardRef, ElementRef} from "@angular/core";
import * as $ from "jquery";

import {VideoList} from "./models";
import {TreeviewItemComponent}  from "./treeview-item.component";
import {VideoService} from "./video.service";

@Component({
    selector: "yap-video-list",
    templateUrl: "./video-list.component.html",
    directives: [forwardRef(() => TreeviewItemComponent)]
})
export class VideoListComponent {
    @Input()
    videoList: VideoList;

    isExpanded = true;

    constructor(private elementRef: ElementRef, private videoService: VideoService) {
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        $(this.elementRef.nativeElement).children().children("ul").toggle("fast");
    }

    onRemove() {
        this.videoService.removeVideoOrList(this.videoList);
    }
}
