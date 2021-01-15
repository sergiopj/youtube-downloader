// schedule (automatic tasks)
const cron = require('node-cron');
const config = require('../config/config');
const logger = require('../utils/loggers/logger-youtube');
const fs = require('fs');
const path = require('path');
const utils = require('../utils/utils');

/* PROCESOS AUTOMATICOS */
// funcion que hace que cada x (time) minutos se borre el dir de las playlist
const deletePlFilesTask = (time, dirPath) => {
    cron.schedule(`*/${time} * * * *`, () => {
        // delete dir 
        const pathToDelete = path.join(__dirname, dirPath);
        utils.verifyUploadDir(pathToDelete)
            .then( () => {
                fs.readdir(pathToDelete, (err, files) => {
                    if (files === 'undefined' || files.length === 0) {
                        logger.info(`[FILESYSTEM] CRON el directorio ${pathToDelete} no existe o está vacio, no hay nada que borrar`);
                    } else {
                        utils.deleteFilesPath(dirPath)
                            .then(() => logger.info(`[FILESYSTEM] CRON ha elmininado el contenido del directorio ${pathToDelete}`))
                            .catch(err => {
                                logger.info(`[ERROR] CRON no ha podido eliminar el contenido del directorio ${pathToDelete}`);
                                console.error(err);
                            });
                    }
                });
            })
            .catch(err => console.error(err));
    });
};


module.exports = {
    deletePlFilesTask
};