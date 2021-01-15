'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = Schema({
    clientIp: String,
    clientIpRoutable: Boolean,
    accessAt: String,
    isAuthoritative: Boolean,
    isMobile: Boolean,
    isTablet: Boolean,
    isiPad: Boolean,
    isiPod: Boolean,
    isiPhone: Boolean,
    isAndroid: Boolean,
    isBlackberry: Boolean,
    isOpera: Boolean,
    isIE: Boolean,
    isEdge: Boolean,
    isIECompatibilityMode: Boolean,
    isSafari: Boolean,
    isFirefox: Boolean,
    isChrome: Boolean,
    isPhantomJS: Boolean,
    isDesktop: Boolean,
    isWindows: Boolean,
    isLinux: Boolean,
    isLinux64: Boolean,
    isMac: Boolean,
    isChromeOS: Boolean,
    isSamsung: Boolean,
    isRaspberry: Boolean,
    isBot: Boolean,
    isCurl: Boolean,
    isAndroidTablet: Boolean,
    isSmartTV: Boolean,
    isFacebook: Boolean,
    browser: String,
    version: String,
    os: String,
    platform: String,
    geoIp: {},
    source: String
});

module.exports = mongoose.model('Client', ClientSchema);