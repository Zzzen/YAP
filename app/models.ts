export interface Video {
    fullpath: string;
    position: number;
}

export interface VideoList {
    name: string;
    videos: Video[];
}

export function isVideoList(arg: any): arg is VideoList {
    return !!arg.name;
}
