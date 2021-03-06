export interface Video {
    fullpath: string;
    position: number;
}

export interface VideoList {
    name: string;
    videos: (Video | VideoList)[];
    isExpanded: boolean;
}

export interface Preference {
    widthOfPlayList: number;
    widthOfWindow: number;
    heightOfWindow: number;
    maximized: boolean;
    volume: number;
    backgroundColorOfPlaylist: string;
    backgroundOpacityOfPlaylist: number;
    fontSize: number;
    fontColor: string;
}

export interface SearchingTask {
    rootDirectory: string;
    currentDirectory: string;
    shouldCancel: boolean;
    compeleted: boolean;
}

export type VideoOrVideoList = Video | VideoList;

export type RootList = VideoOrVideoList[];


export function isVideoList(arg: any): arg is VideoList {
    return !!arg.name;
}

export function isVideo(arg: any): arg is Video {
    return !!arg.fullpath;
}

// a video list is considered to be useful if it (or its children) contains at least one video.
export function isUsefulList(list: VideoList) {
    if (!list.videos.length) {
        return false;
    } else {
        for (const x of list.videos) {
            if (isVideo(x) || isUsefulList(x)) {
                return true;
            }
        }
        return false;
    }
}