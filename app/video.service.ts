import {Injectable, EventEmitter} from "@angular/core";
import {ipcRenderer, remote} from "electron";
import path = require("path");
import {Stats} from "fs";

import {Video, VideoList, VideoOrVideoList, RootList, isVideoList, isVideo} from "./models";
import {getUserData, writeUserData} from "./userData";
import {readDir, stat} from "./promisifiedNode";


@Injectable()
export class VideoService {
    private data: RootList;

    private forceQuit = false;

    public updateEventEmitter = new EventEmitter() as EventEmitter<(Video | VideoList)[]>;

    public playingChange = new EventEmitter() as EventEmitter<Video>;

    constructor() {
        this.data = [];

        ipcRenderer.on("openVideo", (event: any, fullpath: string) => {
            console.log(fullpath);

            const found = this.findVideo(fullpath);

            if (found) {
                this.playVideo(found);
            } else {
                const video = { fullpath, position: 0 };
                this.addData(video);
                this.playVideo(video);
            }
        });


        ipcRenderer.on("openDir", (event: any, dirpath: string) => { this.onDirOpen(dirpath); });

        window.onbeforeunload = event => { this.onWindowClose(event); };

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
                console.log("currentDir: " + currentDir);

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
                        videoList.videos.push({ fullpath: path.join(currentDir, files[i]), position: 0 });
                    } else {
                        const innerList = await createVideoListFromDir(path.join(currentDir, files[i]));
                        videoList.videos.push(innerList);
                    }
                }

                return videoList;
            } catch (err) {
                console.log(err);
                return undefined;
            }
        }

        const videoList = await createVideoListFromDir(dirpath);
        if (videoList) {
            this.data.push(videoList);
        }
    }

    async onWindowClose(event: BeforeUnloadEvent) {
        if (this.forceQuit) {
            event.returnValue = true;
        } else {
            this.forceQuit = true;

            event.returnValue = false;
            remote.getCurrentWindow().hide();

            try {
                await writeUserData(this.data);
            } finally {
                window.close();
            }
        }
    };

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
