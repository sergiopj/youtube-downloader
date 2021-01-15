'use strict'

// server config
const mongoose = require('mongoose');

// custom express config
const app = require('./app');
const port = process.env.PROT || 3001;
const config = require('./config/config');

// db connection
mongoose.Promise = global.Promise;
mongoose.connect(config.databaseUri)
    .then(() => {
        console.log('[SERVER] Connection to db multi-converter is ok!');
        // create server
        app.listen(port, () => {
            console.log(`[SERVER] Server running in port ${port}`);
        }).setTimeout(500000);
    })
    .catch(err => logger.info(err))