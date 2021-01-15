'use strict'

const express = require('express');
const HomeController = require('../controllers/home.controller');
const VideoController = require('../controllers/video.controller');
const AudioController = require('../controllers/audio.controller');
const YoutubeDlController = require('../controllers/youtubeDL.controller');
const FilesInfoController = require('../controllers/info.controller');
const config = require('../config/config');


// upload files
const multipart = require('connect-multiparty');

const uploadDir = `${__dirname}/../${config.filesPath}`;

// public container dir
const mdUpload = multipart({ uploadDir });

const app = express.Router();

/* ROUTES */
// home
app.get('/', HomeController.getInfoClient);

// convert files
app.post('/video', mdUpload, VideoController.uploadVideo);
app.post('/audio', mdUpload, AudioController.uploadAudio);

// download files youtube
app.get('/ytVideo/:id', YoutubeDlController.YoutubeVideoInfo);
app.get('/ytAudio/:id', YoutubeDlController.YoutubeAudioInfo);
app.get('/ytDownload/:id', YoutubeDlController.DownloadYoutubeAudio);
app.get('/ytPlaylist/:id', YoutubeDlController.YoutubePlaylistInfo);

// analitics info
app.get('/renders-info/:page?', FilesInfoController.getAllRendersInfo);
app.get('/render-info/:id', FilesInfoController.getRenderInfoById);


module.exports = app;