import fs = require("fs");

export interface Video {
    fullpath: string;
    position: number;
}

export interface PlayList {
    name: string;
    videos: Video[];
}

export interface RootList {
    items: (Video | PlayList)[];
}

export function isVideo(arg: any): arg is Video {
    return arg.fullpath !== undefined;
}

export function isPlayList(arg: any): arg is PlayList {
    return !isVideo(arg);
}

export function writeUserData(data: Object) {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile("userData.json", JSON.stringify(data, undefined, 4), { encoding: "utf-8" }, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

export function getUserData() {
    return new Promise<string>((resolve, reject) => {
        fs.readFile("userData.json", "utf-8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    });
}

