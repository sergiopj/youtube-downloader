'use strict'

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const RenderSchema = Schema({
    renderInfo: String,
    clientIp: String,
    inputFileType: String, // 'audio', 'video'
    outputFileExt: String, // ej flv
    filename: String,
    inputFileSize: Number,
    renderAt: String,
});

RenderSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('Render', RenderSchema);