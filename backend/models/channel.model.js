'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChannelSchema = Schema({
    channelId: String,
    clientIp: String,
    kind: String, // youtube, wimeo, etc
    title: String,
    url: String,
    description: String,
    downloadAt: String,
    publishedAt: String,
    videosCount: Number,
    etag: String,
    thumbnails: String,
});

module.exports = mongoose.model('Channel', ChannelSchema);