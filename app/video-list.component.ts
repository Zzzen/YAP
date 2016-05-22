import {Component, Input, forwardRef, ElementRef} from "@angular/core";
import * as $ from "jquery";

import {VideoList} from "./models";
import {TreeviewItemComponent}  from "./treeview-item.component";

@Component({
    selector: "yap-video-list",
    template: `
        <a (click)="toggle()" > <span>{{isExpanded? "▼": "▲"}}</span> {{videoList.name}} </a>
        <ul class="yap-video-list">
            <li  *ngFor="let x of videoList.videos">
                <yap-item [data]="x"> </yap-item>            
            </li>
        </ul>
    `,
    directives: [forwardRef(() => TreeviewItemComponent)]
})
export class VideoListComponent {
    @Input()
    videoList: VideoList;

    isExpanded = true;

    constructor(private elementRef: ElementRef) {
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        $(this.elementRef.nativeElement).children("ul").toggle("fast");
    }
}
