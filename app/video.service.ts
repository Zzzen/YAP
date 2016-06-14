import {Injectable, EventEmitter} from "@angular/core";
import {ipcRenderer} from "electron";
import path = require("path");
import {Stats} from "fs";

import {Video, VideoList, VideoOrVideoList, RootList, isVideoList, isVideo, isUsefulList, SearchingTask} from "./models";
import {getUserData, writeUserData} from "./userData";
import {readDir, stat} from "./promisifiedNode";
import {SUPPORTED_FORMAT} from "./config";

@Injectable()
export class VideoService {
    public data: RootList;

    public searchingTasks: SearchingTask[] = [];

    public updateEventEmitter = new EventEmitter<RootList>();

    public playingChange = new EventEmitter() as EventEmitter<Video>;

    constructor() {
        this.data = [];

        ipcRenderer.on("openVideo", (event: any, fullpath: string) => { this.onFileOpen(fullpath); });

        ipcRenderer.on("openDir", (event: any, dirpath: string) => {
            const task: SearchingTask = {
                rootDirectory: dirpath,
                currentDirectory: dirpath,
                shouldCancel: false,
                compeleted: false
            };
            this.searchDirectory(task);
        });


        document.addEventListener('dragover', event => event.preventDefault());

        document.addEventListener('drop', event => {
            event.preventDefault();

            if (event.dataTransfer.files && event.dataTransfer.files[0]) {

                const path = event.dataTransfer.files[0].path;

                (async () => {
                    try {
                        const stats = await stat(path);

                        if (stats.isFile()) {
                            this.onFileOpen(path);
                        } else {
                            const task: SearchingTask = {
                                rootDirectory: path,
                                currentDirectory: path,
                                shouldCancel: false,
                                compeleted: false
                            };
                            this.searchDirectory(task);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                })();
            }

        }, false);


        // read data from config file
        (async () => {
            try {
                (await getUserData()).forEach(x => this.data.push(x));
            } catch (err) {
                this.data = [];
            }
        })();
    }

    getFlattenData(): Video[] {
        function getVideo(x: VideoOrVideoList): Video[] {
            if (isVideo(x)) {
                return [x];
            } else {
                return x.videos.map(getVideo).reduce((prev, curr) => prev.concat(curr), []);
            }
        }

        return this.data.map(getVideo).reduce((prev, curr) => prev.concat(curr), []);
    }

    // prev and next may be undefined.
    getNearbyVideos(current: Video) {
        const flatten = this.getFlattenData();
        return {
            prev: flatten[flatten.indexOf(current) - 1],
            next: flatten[flatten.indexOf(current) + 1]
        };
    }

    async onFileOpen(fullpath: string) {
        fullpath = "file:///" + fullpath.replace(/\\/g, "/");

        if (SUPPORTED_FORMAT.map(x => `.${x}`).indexOf(path.extname(fullpath)) > -1) {
            const found = this.findVideo(fullpath);

            if (found) {
                this.playVideo(found);
            } else {
                const video = { fullpath, position: 0 };
                this.addDataToRootList(video);
                this.playVideo(video);
            }
        }
    }

    async searchDirectory(task: SearchingTask) {
        async function createVideoListFromDir(currentDir: string): Promise<VideoList> {
            try {
                // console.log("currentDir: " + currentDir);
                task.currentDirectory = currentDir;

                if (task.shouldCancel) {
                    return undefined;
                }

                const videoList: VideoList = {
                    name: currentDir,
                    videos: [],
                    isExpanded: false
                };

                const files = await readDir(currentDir);
                const fileStatsPromises = files.map(filename => path.join(currentDir, filename)).map(stat);
                const statses: Stats[] = [];

                for (const promise of fileStatsPromises) {
                    try {
                        statses.push(await promise);
                    } catch (err) {
                        statses.push(undefined);
                    }
                }

                for (let i = 0; i < statses.length; i++) {
                    const stats = statses[i];

                    if (!stats) {
                        continue;
                    }

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

        this.searchingTasks.push(task);

        const videoList = await createVideoListFromDir(task.rootDirectory);
        task.compeleted = true;

        const index = this.searchingTasks.indexOf(task);
        if (index > -1) {
            this.searchingTasks.splice(index, 1);
        }

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
        this.playingChange.emit(video);
    }

    public cancelSearchingTask(task: SearchingTask) {
        task.shouldCancel = true;

        const index = this.searchingTasks.indexOf(task);
        if (index > -1) {
            this.searchingTasks.splice(index, 1);
        }
    }
}