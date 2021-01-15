export class YtbPlayList {
    constructor(
        public playlistId: string,
        public channelUrl: string,
        public channelTitle: string,
        public channelId: string,
        public playlistTitle: string,
        public playlistUrl: string,
        public total: number,
        public items: Array<string>
    ) { }
}