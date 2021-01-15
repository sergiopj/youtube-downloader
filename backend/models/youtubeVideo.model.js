'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const YtVideoSchema = Schema({
    id: String,
    userIp: String,
    channel_url: String,
    channelAvatar: String,
    webpage_url: String,
    channel_id: String,
    thumbnail: String,
    url: String,
    http_headers: Object,
    uploader: String,
    filesize: Number,
    uploader_url: String,
    ext: String,
    _filename: String,
    view_count: Number,
    duration: String,
    format_note: String,
    upload_date: String,
});


module.exports = mongoose.model('YtVideo', YtVideoSchema);