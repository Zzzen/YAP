import {Injectable, EventEmitter, OnInit} from "@angular/core";

import {Video, VideoList, isVideoList} from "./models";

@Injectable()
export class VideoService implements OnInit {
    private data = [
        { fullpath: "1.avi", position: 0 },
        { name: "list1", videos: [{ fullpath: "2.avi", position: 0 }] },
        { name: "list2", videos: [{ fullpath: "3.avi", position: 0 }] }
    ] as (Video | VideoList)[];

    public updateEventEmitter = new EventEmitter();

    ngOnInit() {
        console.log("onInit");
    }

    getData() {
        return Promise.resolve(this.data);
    }

    setData(data: (Video | VideoList)[]) {
        this.data = data;
        this.updateEventEmitter.emit(this.data);
    }

    removeVideo(video: Video) {
        console.log("in service");
        console.log(video);

        const index = this.data.indexOf(video);
        if (index > -1) {
            this.data.splice(index, 1);
        } else {
            let removed = false;
            this.data.forEach(x => {
                if (isVideoList(x)) {
                    const i = x.videos.indexOf(video);
                    if (i > -1) {
                        x.videos.splice(i, 1);
                        removed = true;
                    }
                }
            });
            console.log("result of removing", removed);
        }
    }
}
