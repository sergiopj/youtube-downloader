"use strict";
/* jshint esversion = clientInfo. 6 */
const getIP = require("ipware")().get_ip;
const logger = require("../utils/loggers/logger-client");
const utils = require("../utils/utils");

function getInfoClient(req, res) {
  const ipInfo = getIP(req);
  const dataAnalytics = {
    accessInfo: req.useragent,
    ipInfo,
  };
  try {
    utils.saveStatistics("client", dataAnalytics);
    logger.info(
      `[ANALYTICS] Se guardan en bd los datos del cliente que accede con ip ${ipInfo.clientIp}`
    );
  } catch (error) {
    console.error(err);
    logger.info(
      `[ERROR] No se guardan en bd los datos del client que accede con ip ${ipInfo.clientIp}`
    );
  }
}

module.exports = {
  getInfoClient,
};
