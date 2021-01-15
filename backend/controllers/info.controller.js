'use strict';
/* jshint esversion: 6 */
const Render = require('../models/render.model');

// info of all files render
function getAllRendersInfo(req, res) {
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }

    Render.paginate({}, { offset: page, limit: 10 }, (err, result) => {
        if (err) {
            res.status(500).send({
                message: 'Error at find renders info in mongo'
            });
        }
        if (!result) {
            res.status(404).send({
                message: "Haven't renders info in db"
            });
        } else {
            return res.status(200).send({
                result: result.docs,
                total: result.total,
                pages: Math.ceil(result.total / result.limit)
            });
        }
    });    
}

// only information of uploaded files by id
function getRenderInfoById(req, res) {

    const renderId = req.params.id;

    Render.findById(renderId, (err, renderInfo) => {
        if (err) {
            res.status(500).send({
                message: 'Error at find render info in mongo'
            });
        } else {
            return res.status(200).send({ renderInfo });
        }
    });
}


module.exports = {
    getAllRendersInfo,
    getRenderInfoById
}