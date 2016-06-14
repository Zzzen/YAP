import {Component, Input, forwardRef, ElementRef, OnInit} from "@angular/core";
import * as $ from "jquery";

import {VideoList} from "./models";
import {TreeviewItemComponent}  from "./treeview-item.component";
import {VideoService} from "./video.service";
import {PreferenceService} from "./preference.service";

@Component({
    selector: "yap-video-list",
    templateUrl: "./video-list.component.html",
    directives: [forwardRef(() => TreeviewItemComponent)]
})
export class VideoListComponent implements OnInit {
    @Input()
    videoList: VideoList;

    constructor(private elementRef: ElementRef, private videoService: VideoService, private preferenceService: PreferenceService) {
    }

    toggle() {
        this.videoList.isExpanded = !this.videoList.isExpanded;
        $(this.elementRef.nativeElement).children().children("ul").toggle("fast");
    }

    onRemove() {
        this.videoService.removeVideoOrList(this.videoList);
    }

    ngOnInit() {
        if (!this.videoList.isExpanded) {
            $(this.elementRef.nativeElement).children().children("ul").hide("fast");
        }
    }
}
