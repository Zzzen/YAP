import {Injectable, EventEmitter} from "@angular/core";

import {Video, VideoList, isVideoList, RootList} from "./models";

import {ipcRenderer, remote} from "electron";

import {getUserData, writeUserData} from "./userData";

@Injectable()
export class VideoService {
    private data: RootList;

    public updateEventEmitter = new EventEmitter() as EventEmitter<(Video | VideoList)[]>;

    public playingChange = new EventEmitter() as EventEmitter<Video>;

    constructor() {
        this.data = [];

        ipcRenderer.on("openVideo", (event: any, fullpath: string) => {
            console.log(fullpath);

            const video = {
                fullpath,
                position: 0
            };

            this.addData(video);
            this.playVideo(video);
        });



        remote.getCurrentWindow().on("close", event => {
            writeUserData(this.data);
        });

        (async () => {
            try {
                (await getUserData()).forEach(x => this.data.push(x));
            } catch (err) {
                this.data = [];
            }
        })();

    }

    getData() {
        return Promise.resolve(this.data);
    }

    setData(data: RootList) {
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

    addData(data: Video | VideoList) {
        this.data.push(data);
    }

    playVideo(video: Video) {
        console.log(this.data);
        this.playingChange.emit(video);
    }
}
