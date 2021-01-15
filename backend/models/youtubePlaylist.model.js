'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const youtubePlaylistSchema = Schema({
    channelId: String,
    clientIp: String,
    channelTitle: String,
    channelUrl: String,
    playlistId: String,
    playlistTitle: String,
    playlistUrl: String,
    videosCount: Number,
    downloadAt: String,
    videosData: String
});

module.exports = mongoose.model('YoutubePlaylist', youtubePlaylistSchema);