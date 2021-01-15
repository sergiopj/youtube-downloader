"use strict";
/* jshint esversion: 6 */

const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const utils = require("../utils/utils");
const fs = require("fs");
const config = require("../config/config");
const logger = require("../utils/loggers/logger-convert");
const getIP = require("ipware")().get_ip;
ffmpeg.setFfmpegPath(ffmpegPath);

function uploadAudio(req, res) {
    if (!req.files.file) {
        logger.info("[ERROR] No hay un fichero de audio en el request");
        return res.status(200).send({
            message: `No audio file in your request`,
        });
    } else {
        const uploadAudio = req.files.file;
        // validate and render audio
        audioFileValidator(uploadAudio, res);
        const convertExtension = req.body.convertExtension;
        renderAudio(uploadAudio, convertExtension, res, req);
    }
}

async function renderAudio(uploadAudio, convertExtension, res, req) {
    const filePath = uploadAudio.path;

    let originalExtFile = uploadAudio.type.split("/")[1];

    const clientIp = getIP(req).clientIp;

    if (originalExtFile === "mpeg") {
        originalExtFile = "mp3";
    }

    const renderFilePath = uploadAudio.name.replace(
        `.${originalExtFile}`,
        `.${convertExtension}`
    );
    try {
        await utils.verifyUploadDir(
            path.join(__dirname, `../${config.rendersPath}`)
        );
    } catch (error) {
        console.error(err);
        logger.info(
            `[ERROR] No se se ha podido renderizar el audio ${uploadAudio.name}`
        );
    }
    try {
        ffmpeg(filePath)
            .toFormat(convertExtension)
            .on("error", (err) => {
                logger.info(
                    `[ERROR] No se ha podido convertir a .${convertExtension} el archivo ${uploadAudio.name}`
                );
                console.error(
                    `The conversion could not be done, please try it with another file`,
                    err.message
                );
            })
            .on("progress", (progress) => {
                console.log("Processing: " + progress.currentKbps + " KB converted");
            })
            .on("end", async(stdout, stderr) => {
                logger.info(
                    `[RENDER] Se ha convertido correctamente el archivo ${uploadAudio.name} a ${convertExtension}`
                );
                const dataAnalytics = {
                    renderInfo: stderr,
                    fileData: uploadAudio,
                    convertExtension,
                    clientIp,
                };
                try {
                    utils.saveStatistics("render", dataAnalytics);
                    logger.info(
                        `[ANALYTICS] Se guardan en bd los datos del audio ${uploadAudio.name}`
                    );
                } catch (err) {
                    console.error(err);
                    logger.info(
                        `[ERROR] No se guardan en bd los datos del audio ${uploadAudio.name}`
                    );
                }
                // We replaced all the event handlers with a simple call to readStream.pipe()
                logger.info(
                    `[RESPONSE] Se devuelve correctamente el audio ${renderFilePath}`
                );
                const file = await fs.readFileSync(
                    path.join(__dirname, `../${config.rendersPath}/${renderFilePath}`)
                );
                res.send(file);
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
    } catch (error) {}
}

function audioFileValidator(audioFile, res) {
    // type
    const audioTypesAllowed = ["mp3", "wav", "flac", "ogg", "mpeg", "webm"];
    const fileAudioFormat = audioFile.type.split("/")[1];
    const megasfileSize = audioFile.size / 1000000;

    // filesize > 0 megas && < 100 megas
    if (megasfileSize > 0 && megasfileSize < 100) {
        if (audioTypesAllowed.indexOf(fileAudioFormat) !== -1) {
            logger.info(
                `[RENDER] El archivo con ext ${fileAudioFormat} se admite para el renderizado input`
            );
        } else {
            // delete invalid img
            utils.deleteFilesPath(path.join(__dirname, `../${config.rendersPath}`));
            logger.info(
                `[ERROR] El archivo con ext ${fileAudioFormat} no se admite para el renderizado`
            );
            res.status(200).send({
                ok: true,
                message: `The audio extension ${fileAudioFormat} is not allowed`,
                audioTypesAllowed,
            });
        }
    } else {
        // delete invalid file
        utils.deleteFilesPath(path.join(__dirname, `../${config.rendersPath}`));
        logger.info(
            `[ERROR] El archivo pesa ${megasfileSize} megas el minimo es 0,1 y max 100, se cancela el render`
        );
        res.status(200).send({
            ok: true,
            message: `The audio size is too big - ${megasfileSize} megas - max 100`,
        });
    }
}

module.exports = {
    uploadAudio,
};