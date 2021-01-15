const { createLogger, format, transports } = require('winston');
const path = require('path');
const utils = require('../utils');

// para usar el logger en toda la app RENDERS
module.exports = createLogger({
    format: format.combine(
        format.simple(),
        format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
        format.printf( info => `[${info.timestamp}][${info.level.toUpperCase()}]${info.message}`),
    ),
    // logger de consola o file etc, cada transport gestiona un tipo
    transports: [
        new transports.Console({
            level: 'debug'
        }),
        // escribe info en un fichero de log, para añadir nuevas lineas durante la app, usar logger.info('texto')
        new transports.File({
            maxsize: 5120000, // 5 mg aprox
            maxFiles: 10,
            filename: path.join(__dirname, `../../logs/mcConvert_${utils.currentDate('standard')}.log`)
        })
    ]
})