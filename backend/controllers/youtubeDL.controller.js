"use strict";
// models
const utils = require("../utils/utils");
const logger = require("../utils/loggers/logger-youtube");
const config = require("../config/config");
const getIP = require("ipware")().get_ip;
const YoutubeMp3Downloader = require("youtube-mp3-downloader");
const path = require("path");
const ytch = require("yt-channel-info");
const ytpl = require("ytpl");

function YoutubeVideoInfo(req, res) {
    const userIp = getIP(req).clientIp;
    const id = req.params.id;
    const videoUrl = config.youtubeUrl + id;

    if (!id) {
        logger.info("[ERROR] No llega el param id por url");
        res.status(500).send("id url param is required");
    }

    logger.info(`[REQUEST] Un usuario pide descargar un video con id ${id}`);

    try {
        utils.getYtVideoinfo(videoUrl, "video").then((dataVideo) => {
            console.log('dataVideo TEST', dataVideo)

            const channelId = dataVideo.channel_id;
            ytch
                .getChannelInfo(channelId)
                .then((response) => {
                    dataVideo.channelThumbnailUrl = response.authorThumbnails[2].url;
                    // console.log('video info ', dataVideo)
                    dataVideo.userIp = userIp;
                    // if there are no errors return data
                    res.status(200).json({
                        ok: true,
                        dataVideo,
                    });
                    utils
                        .saveStatistics("ytVideo", dataVideo)
                        .then((info) => {
                            logger.info(
                                `[ANALYTICS] Se guardan en bd los datos del url -- ${info._id}`
                            );
                        })
                        .catch((err) => {
                            logger.info(
                                `[ERROR] No se guardan en bd los datos del url -- ${videoUrl}`
                            );
                        });
                })
                .catch((err) => {
                    logger.info(
                        `[ERROR] No se pudieron obtener los datos del video con id ${id}`
                    );
                    return res.status(500).json({
                        ok: false,
                        message: "The video data could not be obtained",
                        videoId: id,
                        err,
                    });
                });
        }).catch(err => {
            logger.info(
                `[ERROR] No se pudieron obtener los datos del video con id ${id}`
            );
            return res.status(500).json({
                ok: false,
                message: "The video data could not be obtained",
                videoId: id,
                err,
            });
        });
    } catch (error) {
        logger.info(
            `[ERROR] No se pudieron obtener los datos del video con id ${id}`
        );
        return res.status(400).json({
            ok: false,
            message: "The video data could not be obtained",
            videoId: id,
            error,
        });
    }
}

async function YoutubePlaylistInfo(req, res) {
    const plId = req.params.id;

    // output file audio | video
    logger.info(
        `[REQUEST] Un usuario pide descargar la playlist con id ${req.params.id}`
    );

    // se le enchufa la url
    const playlist = await ytpl(plId);

    if (playlist) {
        // guardamos estadisticas en bd
        utils
            .saveStatistics("ytPlaylist", playlist)
            .then((info) => {
                // id en mongo no del canal
                logger.info(
                    ` [ANALYTICS] Se guardan en bd los datos de la ytPlaylist con id ${info._id}
    `
                );
            })
            .catch((err) => {
                console.error(err);
                logger.info(
                    ` [ERROR] No se guardan en bd los datos de la ytPlaylist con id ${plId}
    `
                );
            });

        logger.info(
            ` [RESPONSE] Se devuelven los datos con la playlist con id ${plId}
    `
        );
        res.status(200).json({
            ok: true,
            playlist,
        });
    } else {
        logger.info(
            ` [ERROR] NO se pueden obtener los datos de la playlist con id ${plId}`);
        return res.status(400).json({
            ok: false,
            message: `No se pudieron obtener los datos de la playlist con id ${plId}`,
            error,
        });

    }

}

function YoutubeAudioInfo(req, res) {
    const userIp = getIP(req).clientIp;
    const id = req.params.id;
    const videoUrl = config.youtubeUrl + id;

    if (!id) {
        logger.info("[ERROR] No llega el param id por url");
        res.status(500).send("id url param is required");
    }

    logger.info(` [REQUEST] Un usuario pide descargar un video con id ${id}`);

    try {
        utils.getYtVideoinfo(videoUrl, "audio").then((dataAudio) => {
            dataAudio.userIp = userIp;
            utils
                .saveStatistics("ytVideo", dataAudio)
                .then((info) => {
                    logger.info(
                        ` [ANALYTICS] Se guardan en bd los datos del url-- ${info._id}
    `
                    );
                })
                .catch((err) => {
                    logger.info(
                        ` [ERROR] No se guardan en bd los datos del url-- ${videoUrl}
    `
                    );
                });
            // if there are no errors return data
            res.status(200).json({
                ok: true,
                dataAudio,
            });
        });
    } catch (error) {
        logger.info(
            ` [ERROR] No se pudieron obtener los datos del audio con id ${id}`
        );
        return res.status(400).json({
            ok: false,
            message: "The video data could not be obtained",
            videoId: id,
            error,
        });
    }
}

function DownloadYoutubeAudio(req, res) {
    const videoId = req.params.id;

    const videoUrl = `http://www.youtube.com/watch?v=${videoId}`;

    try {
        utils.getYtVideoinfo(videoUrl, "audio").then((fileInfo) => {
            let filePath = path.join(
                __dirname,
                `../${config.filesPath}/${fileInfo._filename.split(".webm")[0]}.mp3`
            );

            //Configure YoutubeMp3Downloader with your settings
            var YD = new YoutubeMp3Downloader({
                ffmpegPath: "/usr/bin/ffmpeg", // this libray require install ffmpeg in os || FFmpeg binary location
                outputPath: path.join(__dirname, `../${config.filesPath}`), // Output file location (default: the home directory)
                youtubeVideoQuality: "highestaudio", // Desired video quality (default: highestaudio)
                queueParallelism: 2, // Download parallelism (default: 1)
                progressTimeout: 2000, // Interval in ms for the progress reports (default: 1000)
            });

            //Download video and save as MP3 file
            YD.download(videoId, `${fileInfo._filename.split(".webm")[0]}.mp3`);

            YD.on("finished", (err, data) => {
                logger.info(
                    `[FILESYSTEM] se ha podido descargado correctamente el audio de yt con el id - ${videoId}`
                );
                res.download(filePath);
                utils
                    .deleteFilesPath(`../${config.filesPath}`)
                    .then(() =>
                        logger.info(
                            "[FILESYSTEM] Se ha elmininado el contenido del directorio ../public/files"
                        ))
                    .catch((err) => {
                        logger.info(
                            "[ERROR] No se ha podido eliminar el contenido del directorio ../public/files"
                        );
                        throw new Error(err);
                    });
            });

            YD.on("error", (error) => {
                logger.info(
                    ` [ERROR] NO se ha podido descargar el audio de yt con el id - ${videoId}`
                );

                console.log(error);
            });

            YD.on("progress", (progress) => {
                console.log(JSON.stringify(progress));
            });
        });
    } catch (error) {
        logger.info(
            ` [ERROR] No se pudieron obtener los datos del file con id $ { videoId }
                                `
        );
        return res.status(400).json({
            ok: false,
            message: "The file data could not be obtained",
            videoId,
            error,
        });
    }
}

module.exports = {
    YoutubeVideoInfo,
    YoutubeAudioInfo,
    DownloadYoutubeAudio,
    YoutubePlaylistInfo
};