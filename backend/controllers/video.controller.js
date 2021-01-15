"use strict";
/* jshint esversion: 6 */

const fs = require("fs");
const Render = require("../models/render.model");
const path = require("path");
const utils = require("../utils/utils");
const config = require("../config/config");
const logger = require("../utils/loggers/logger-convert");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const getIP = require("ipware")().get_ip;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

// TODO si no existe el path renders y files lo creamos
async function uploadVideo(req, res) {
    if (!req.files.file) {
        logger.info("[ERROR] No hay un fichero de video en el request");
        return res.status(200).send({
            message: `No video file in your request`,
        });
    } else {
        const uploadVideo = req.files.file;
        const convertExtension = req.body.convertExtension;

        // validate and render video
        await videoFileValidator(uploadVideo, convertExtension, res);
        renderVideo(uploadVideo, convertExtension, res, req);
    }
}

async function renderVideo(uploadVideo, convertExtension, res, req) {
    const videoRender = new Render();

    const clientIp = getIP(req).clientIp;

    // para ello sacamos el tipo del video original en type:... y lo sustituimos el .xxx por el convertRxtension
    let originalExtFile = uploadVideo.type.split("/")[1];

    if (originalExtFile === "x-matroska") {
        originalExtFile = "mkv";
    }

    if (originalExtFile === "x-msvideo") {
        originalExtFile = "avi";
    }

    const renderFilePath = uploadVideo.name.replace(
        `.${originalExtFile}`,
        `.${convertExtension}`
    );

    // busca el video a convertir en disco
    await ffmpeg(uploadVideo.path)
        .toFormat(convertExtension)
        .on("error", (err) => {
            logger.info(
                `[ERROR] No se ha podido convertir a .${convertExtension} el archivo ${uploadVideo.name}`
            );
            videoRender.failed = true;
            // return error at client
            console.error(`Error when render file ${uploadVideo.path}`, err.message);
            return res.status(400).send({
                ok: false,
                message: `Error when render file ${uploadVideo.path} ${err.message}`,
            });
        })
        .on("progress", (progress) => {
            // TODO mandarlo al front
            console.log("Processing: ", JSON.stringify(progress));
        })
        .on("end", async(stdout, stderr) => {
            logger.info(
                `[RENDER] Se ha convertido correctamente el archivo ${uploadVideo.name} a ${convertExtension}`
            );
            const dataAnalytics = {
                renderInfo: stderr,
                fileData: uploadVideo,
                convertExtension,
                clientIp,
            };
            utils
                .saveStatistics("render", dataAnalytics)
                .then((info) => {
                    logger.info(
                        `[ANALYTICS] Se guardan en bd los datos del video con id ${info._id}`
                    );
                })
                .catch((err) => {
                    logger.info(
                        `[ERROR] No se guardan en bd los datos del video ${uploadVideo.name}`
                    );
                });

            const file = await fs.readFileSync(
                path.join(__dirname, `../${config.rendersPath}/${renderFilePath}`)
            );

            res.send(file);

            logger.info(
                `[RESPONSE] Se devuelve correctamente el video ${renderFilePath}`
            );

            // delete files after response
            utils
                .deleteFilesPath(`../${config.rendersPath}`)
                .then(() =>
                    logger.info(
                        "[FILESYSTEM] Se ha elmininado el contenido del directorio ../public/renders"
                    )
                )
                .catch((err) => {
                    logger.info(
                        "[ERROR] No se ha podido eliminar el contenido del directorio ../public/renders"
                    );
                    throw new Error(err);
                });

            utils
                .deleteFilesPath(`../${config.filesPath}`)
                .then(() =>
                    logger.info(
                        "[FILESYSTEM] Se ha elmininado el contenido del directorio ../public/files"
                    )
                )
                .catch((err) => {
                    logger.info(
                        "[ERROR] No se ha podido eliminar el contenido del directorio ../public/files"
                    );
                    throw new Error(err);
                });
        })
        .save(path.join(__dirname, `../${config.rendersPath}/${renderFilePath}`)); //path where you want to save your file
}

function videoFileValidator(inputVideoFile, outputRenderFile, res) {
    // tipos de video de entrada x-matroska(mkv)
    const inputVideoTypesAllowed = [
        "x-msvideo",
        "avi",
        "x-matroska",
        "mp4",
        "mpeg",
        "mkv",
    ];
    // tipos de video de render x-msvideo(avi)
    const renderVideoTypesAllowed = ["avi", "mp4", "mpeg", "mp3"];

    const inputFileVideoFormat = inputVideoFile.type.split("/")[1];
    const megasfileSize = inputVideoFile.size / 1000000;

    // filesize > 0 megas && < 200 megas
    if (megasfileSize > 0 && megasfileSize < 150) {
        if (inputVideoTypesAllowed.indexOf(inputFileVideoFormat) !== -1) {
            logger.info(
                `[RENDER] El archivo con ext ${inputFileVideoFormat} se admite para el renderizado input`
            );
        } else {
            // delete invalid video
            utils.deleteFilesPath(`../${config.filesPath}`);
            logger.info(
                `[ERROR] El archivo con ext ${inputFileVideoFormat} no se admite para el renderizado`
            );
            return res.status(400).send({
                ok: false,
                message: `The input of video extension ${inputFileVideoFormat} is not allowed`,
                inputVideoTypesAllowed,
            });
        }
        if (renderVideoTypesAllowed.indexOf(outputRenderFile) !== -1) {
            logger.info(
                `[RENDER] El archivo con ext ${outputRenderFile} se admite para el renderizado output`
            );
        } else {
            // delete invalid video
            utils.deleteFilesPath(`../${config.filesPath}`);
            logger.info(
                `[ERROR] El archivo con ext ${outputRenderFile} no se admite para el renderizado`
            );
            return res.status(400).send({
                ok: false,
                message: `The output of video extension ${outputRenderFile} is not allowed`,
                renderVideoTypesAllowed,
            });
        }
    } else {
        // delete invalid video
        utils.deleteFilesPath(`../${config.filesPath}`);
        logger.info(
            `[ERROR] El archivo pesa ${megasfileSize} megas el minimo es 0,1 y max 150, se cancela el render`
        );
        return res.status(400).send({
            ok: false,
            message: `The audio size is too big - ${megasfileSize} megas - max 150`,
        });
    }
}

module.exports = {
    uploadVideo,
};