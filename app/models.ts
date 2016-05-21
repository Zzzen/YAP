export interface Video {
    fullpath: string;
    position: number;
}

export interface VideoList {
    name: string;
    videos: (Video | VideoList)[];
}

export type VideoOrVideoList = Video | VideoList;

export type RootList = VideoOrVideoList[];


export function isVideoList(arg: any): arg is VideoList {
    return !!arg.name;
}

export function isVideo(arg: any): arg is Video {
    return !!arg.fullpath;
}
