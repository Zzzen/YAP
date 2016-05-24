import {VideoService}  from "./video.service";
import {Video, VideoList} from "./models";

let instance: DataCache = undefined;


export class DataCache {

    videoService: VideoService;

    public tmp = [] as (Video | VideoList)[];

    public static getInstance() {
        if (!instance) {
            instance = new DataCache();
        }

        return instance;
    }

    public addData(data: Video | VideoList) {
        if (this.videoService) {
            this.videoService.addDataToRootList(data);
        } else {
            this.tmp.push(data);
        }
    }
}
