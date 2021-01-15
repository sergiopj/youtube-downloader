export class YtbVideo {
    constructor(
        public videoId: string,
        public url: string,
        public title: string,
        public owner: string,
        public thumbnailUrl: string,
        public datePublished: string,
        public duration: string,
        public channelId: string,
        public views: number,
        public channelThumbnailUrl: string
    ) { }
}

