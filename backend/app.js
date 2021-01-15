'use strict'

// express app config
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const useragent = require('express-useragent');
const path = require('path');

// load routes
const fileRoutes = require('./routes/file.routes');

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(useragent.express());

// conver req to json
app.use(bodyParser.json());

// cors and headers
app.use(cors());

// directorio publico
app.use('/public', express.static(path.join(__dirname, '../public')));

// use routes
app.use('/', fileRoutes);

// export config
module.exports = app;