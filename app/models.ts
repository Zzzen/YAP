export interface Video {
    fullpath: string;
    position: number;
}

export interface VideoList {
    name: string;
    videos: Video[];
}

export type RootList = (Video | VideoList)[];


export function isVideoList(arg: any): arg is VideoList {
    return !!arg.name;
}
