const fs = require("fs");
const Shell = require("shelljs");
const path = require("path");
const rimraf = require("rimraf");
const ytdl = require("youtube-dl");
const ytdlCore = require('ytdl-core');


// models
const Render = require("../models/render.model");
const Client = require("../models/client.model");
const Channel = require("../models/channel.model");
const YtVideo = require("../models/youtubeVideo.model");
const YtPlaylist = require("../models/youtubePlaylist.model");

// si no existe un dir lo crea
const verifyUploadDir = async(path) => {
    return new Promise(async(resolve, reject) => {
        if (!fs.existsSync(path)) {
            // i need create dirs to save upload videos and renders
            Shell.mkdir("-p", path);
            resolve();
        }
        resolve();
    });
};

// borrar ficheros y dirs dentro de un dir
const deleteFilesPath = (filesPath) => {
    return new Promise(async(resolve, reject) => {
        // primero comprobar que existe el path con el fichero
        const dirPath = path.join(__dirname, filesPath);
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                reject(err);
            }
            if (files === "undefined") {
                resolve();
            } else {
                // elimina el contenido del dir pero no el dir mismo (/*.*)
                rimraf(dirPath + "/*.*", () => {
                    resolve();
                });
            }
        });
    });
};

// devuelve una promesa despues de zipear un directorio completo, puede servir para devolver playlist de pocos videos 5 max
const zipDirectory = (source, out, res) => {
    const archive = archiver("zip", { zlib: { level: 0 } });
    const stream = fs.createWriteStream(out);
    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on("error", (err) => reject(err))
            .pipe(stream);

        stream.on("close", () => resolve(res));
        archive.finalize();
    });
};

function getYtVideoinfo(url, type) {
    return new Promise(async(resolve, reject) => {
        const format = type === "video" ? "22" : "251";
        // to change filename  -o "1-%(uploader)s%(title)s.%(ext)s"
        const options = [
            `--format=${format}`,
            "--extract-audio",
            "--audio-format",
            "mp3",
        ];
        ytdl.getInfo(url, options, async(err, info) => {
            if (err) {
                await altYtVideoInfo(url)
                    .then(info => {
                        const altData = {
                            id: info.videoDetails.videoId,
                            channel_url: info.videoDetails.author.channel_url,
                            channel_id: info.videoDetails.channelId,
                            thumbnail: info.videoDetails.thumbnails[4].url,
                            url: info.formats.filter(video => video.hasVideo === true && video.hasAudio === true)[0].url,
                            uploader: info.videoDetails.author.name,
                            uploader_url: info.videoDetails.author.channel_url,
                            _filename: info.videoDetails.title + '.mp4',
                            view_count: info.videoDetails.viewCount,
                            ext: 'mp4'
                        };
                        resolve(altData);
                    })
                    .catch(err => reject(err))
            } else {
                const data = {
                    userIp: "",
                    id: info.id,
                    channel_url: info.channel_url,
                    webpage_url: info.webpage_url,
                    channel_id: info.channel_id,
                    thumbnail: info.thumbnail,
                    url: info.url,
                    http_headers: info.http_headers,
                    uploader: info.uploader,
                    filesize: info.filesize,
                    uploader_url: info.uploader_url,
                    ext: info.ext,
                    _filename: info._filename,
                    view_count: info.view_count,
                    duration: info.duration,
                    format_note: info.format_note,
                    upload_date: info.upload_date,
                };
                resolve(data);
            }
        });
    });
}

function altYtVideoInfo(videoUrl) {
    return new Promise((resolve, reject) => {
        ytdlCore.getInfo(videoUrl)
            .then(dataVideo => resolve(dataVideo)).catch(err => reject(err))
    });
}

function saveStatistics(model, data) {
    return new Promise((resolve, reject) => {
        switch (model) {
            case "render":
                const render = new Render();
                // ipuser
                render.clientIp = data.clientIp;
                render.renderInfo = data.renderInfo;
                render.inputFileType = data.fileData.type; // 'audio', 'video', 'image'
                render.outputFileExt = data.convertExtension; // ej flv
                render.filename = data.fileData.name;
                render.inputFileSize = data.fileData.size;
                render.renderAt = currentDate();
                render
                    .save()
                    .then((renderInfo) => resolve(renderInfo))
                    .catch((err) => reject(err));
                break;
            case "channel":
                const channel = new Channel();
                channel.channelId = data.channelInfo.id;
                channel.clientIp = data.clientIp;
                channel.kind = data.channelInfo.kind; // youtube, wimeo, etc
                channel.title = data.channelInfo.snippet.title;
                channel.url = data.channelUrl;
                channel.description = data.channelInfo.snippet.description;
                channel.publishedAt = data.channelInfo.snippet.publishedAt;
                channel.downloadAt = currentDate();
                channel.videosCount = data.videosCount;
                channel.etag = data.channelInfo.etag;
                channel.thumbnails = JSON.stringify(
                    data.channelInfo.snippet.thumbnails
                );
                channel
                    .save()
                    .then((channelInfo) => resolve(channelInfo))
                    .catch((error) => reject(error));
                break;
            case "ytPlaylist":
                const ytPlaylist = new YtPlaylist();
                ytPlaylist.channelId = data.channelId;
                ytPlaylist.channelTitle = data.channelTitle;
                ytPlaylist.channelUrl = data.channelUrl;
                ytPlaylist.playlistId = data.playlistId;
                ytPlaylist.playlistTitle = data.playlistTitle;
                ytPlaylist.playlistUrl = data.playlistUrl;
                ytPlaylist.videosCount = data.total;
                ytPlaylist.downloadAt = currentDate();
                ytPlaylist.videosData = JSON.stringify(data.items);
                ytPlaylist
                    .save()
                    .then((plInfo) => resolve(plInfo))
                    .catch((error) => reject(error));
                break;
            case "ytVideo":
                const ytVideo = new YtVideo();
                ytVideo.id = data.id;
                ytVideo.userIp = data.userIp;
                ytVideo.channel_url = data.channel_url;
                ytVideo.webpage_url = data.webpage_url;
                ytVideo.channel_id = data.channel_id;
                ytVideo.thumbnail = data.thumbnail;
                ytVideo.url = data.url;
                ytVideo.http_headers = data.http_headers;
                ytVideo.uploader = data.uploader;
                ytVideo.filesize = data.filesize;
                ytVideo.uploader_url = data.uploader_url;
                ytVideo.ext = data.ext;
                ytVideo._filename = data._filename;
                ytVideo.view_count = data.view_count;
                ytVideo.duration = data.duration;
                ytVideo.format_note = data.format_note;
                ytVideo.upload_date = data.upload_date;
                ytVideo
                    .save()
                    .then((vidInfo) => resolve(vidInfo))
                    .catch((error) => reject(error));
                break;
            case "client":
                const client = new Client();
                client.clientIp = data.ipInfo.clientIp;
                client.clientIpRoutable = data.ipInfo.clientIpRoutable;
                client.accessAt = currentDate();
                client.isAuthoritative = data.accessInfo.isAuthoritative;
                client.isMobile = data.accessInfo.isMobile;
                client.isTablet = data.accessInfo.isTablet;
                client.isiPad = data.accessInfo.isiPad;
                client.isiPod = data.accessInfo.isiPod;
                client.isiPhone = data.accessInfo.isiPhone;
                client.isAndroid = data.accessInfo.isAndroid;
                client.isBlackberry = data.accessInfo.isBlackberry;
                client.isOpera = data.accessInfo.isOpera;
                client.isIE = data.accessInfo.isIE;
                client.isEdge = data.accessInfo.isEdge;
                client.isIECompatibilityMode = data.accessInfo.isIECompatibilityMode;
                client.isSafari = data.accessInfo.isSafari;
                client.isFirefox = data.accessInfo.isFirefox;
                client.isChrome = data.accessInfo.isChrome;
                client.isPhantomJS = data.accessInfo.isPhantomJS;
                client.isDesktop = data.accessInfo.isDesktop;
                client.isWindows = data.accessInfo.isWindows;
                client.isLinux = data.accessInfo.isLinux;
                client.isLinux64 = data.accessInfo.isLinux64;
                client.isMac = data.accessInfo.isMac;
                client.isChromeOS = data.accessInfo.isChromeOS;
                client.isSamsung = data.accessInfo.isSamsung;
                client.isRaspberry = data.accessInfo.isRaspberry;
                client.isBot = data.accessInfo.isBot;
                client.isCurl = data.accessInfo.isCurl;
                client.isAndroidTablet = data.accessInfo.isAndroidTablet;
                client.isSmartTV = data.accessInfo.isSmartTV;
                client.isFacebook = data.accessInfo.isFacebook;
                client.browser = data.accessInfo.browser;
                client.version = data.accessInfo.version;
                client.os = data.accessInfo.os;
                client.platform = data.accessInfo.platform;
                client.geoIp = data.accessInfo.geoIp;
                client.source = data.accessInfo.source;
                client
                    .save()
                    .then((clientInfo) => resolve(clientInfo))
                    .catch((error) => reject(error));
                break;
            default:
                break;
        }
    });
}

// funcion para recoger un string y que lo limpie de espacios, tildes, mayusculas
const cleanStr = async(string) => {
    // quitamos espacios y mayusculas
    string = string.replace(/ /g, "-");
    string = string.toLowerCase();
    const from = "ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç",
        to = "AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc",
        re = new RegExp(`[${from}]`, "ug");
    return string.replace(re, (match) => to.charAt(from.indexOf(match)));
};

// obtiene la fecha actual /dd/mm/yy
const currentDate = (kindTime) => {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    const yyyy = today.getFullYear();
    const hh = today.getHours();
    const mms = today.getMinutes();
    const ss = today.getSeconds();
    today = `${dd}-${mm}-${yyyy}`;
    return kindTime === "standard" ? today : `${today}_${hh}:${mms}:${ss}`;
};

module.exports = {
    verifyUploadDir,
    deleteFilesPath,
    zipDirectory,
    cleanStr,
    currentDate,
    saveStatistics,
    getYtVideoinfo,
};