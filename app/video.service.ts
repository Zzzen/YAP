import {Injectable, EventEmitter} from "@angular/core";
import {ipcRenderer} from "electron";
import path = require("path");
import {Stats} from "fs";

import {Video, VideoList, VideoOrVideoList, RootList, isVideoList, isVideo, isUsefulList} from "./models";
import {getUserData, writeUserData} from "./userData";
import {readDir, stat} from "./promisifiedNode";
import {SUPPORTED_FORMAT} from "./config";

@Injectable()
export class VideoService {
    private data: RootList;

    public updateEventEmitter = new EventEmitter<RootList>();

    public playingChange = new EventEmitter() as EventEmitter<Video>;

    constructor() {
        this.data = [];

        ipcRenderer.on("openVideo", (event: any, fullpath: string) => {
            const found = this.findVideo(fullpath);

            if (found) {
                this.playVideo(found);
            } else {
                fullpath = "file:///" + fullpath.replace(/\\/g, "/");
                const video = { fullpath, position: 0 };
                this.addDataToRootList(video);
                this.playVideo(video);
            }
        });


        ipcRenderer.on("openDir", (event: any, dirpath: string) => { this.onDirOpen(dirpath); });


        // read data from config file
        (async () => {
            try {
                (await getUserData()).forEach(x => this.data.push(x));
            } catch (err) {
                this.data = [];
            }
        })();
    }

    async onDirOpen(dirpath: string) {
        async function createVideoListFromDir(currentDir: string): Promise<VideoList> {
            try {
                // console.log("currentDir: " + currentDir);

                const videoList: VideoList = {
                    name: currentDir,
                    videos: []
                };

                const files = await readDir(currentDir);
                const fileStatsPromises = files.map(filename => path.join(currentDir, filename)).map(stat);
                const statses: Stats[] = [];

                for (const promise of fileStatsPromises) {
                    statses.push(await promise);
                }

                for (let i = 0; i < statses.length; i++) {
                    const stats = statses[i];
                    if (stats.isFile()) {
                        if (SUPPORTED_FORMAT.map(x => `.${x}`).indexOf(path.extname(files[i]).toLowerCase()) > -1) {
                            const url = "file:///" + path.join(currentDir, files[i]).replace(/\\/g, "/");
                            videoList.videos.push({ fullpath: url, position: 0 });
                        }
                    } else {
                        const innerList = await createVideoListFromDir(path.join(currentDir, files[i]));
                        if (isUsefulList(innerList)) {
                            videoList.videos.push(innerList);
                        }
                    }
                }

                return videoList;
            } catch (err) {
                console.log(err);
                return undefined;
            }
        }

        function removeRedundantPath(list: VideoList) {
            list.videos.forEach(x => {
                if (isVideoList(x)) {
                    removeRedundantPath(x);
                    x.name = x.name.replace(list.name + "\\", "");
                }
            });
        }

        const videoList = await createVideoListFromDir(dirpath);
        if (videoList) {
            removeRedundantPath(videoList);
            this.data.push(videoList);
        }
    }

    async saveData() {
        return await writeUserData(this.data);
    }

    getData() {
        return Promise.resolve(this.data);
    }

    setData(data: RootList) {
        this.data = data;
        this.updateEventEmitter.emit(this.data);
    }

    removeVideoOrList(videoToRemove: Video | VideoList) {

        function iter(list: VideoList) {
            const index = list.videos.indexOf(videoToRemove);
            if (index > -1) {
                list.videos.splice(index, 1);
            } else {
                list.videos.filter(isVideoList).forEach(iter);
            }
        }

        const index = this.data.indexOf(videoToRemove);
        if (index > -1) {
            this.data.splice(index, 1);
        } else {
            this.data.filter(isVideoList).forEach(iter);
        }
    }

    addDataToRootList(data: Video | VideoList) {
        this.data.push(data);
    }

    findVideo(fullpath: string) {
        function iter(x: VideoOrVideoList): Video {
            if (isVideo(x)) {
                return x.fullpath === fullpath ? x : undefined;
            } else {
                return x.videos.map(iter).reduce((prev, current) => { return prev || current; }, undefined);
            }
        }

        return this.data.map(iter).reduce((prev, current) => { return prev || current; }, undefined);
    }

    playVideo(video: Video) {
        console.log(this.data);
        this.playingChange.emit(video);
    }
}
