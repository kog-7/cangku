let versionUtils = require('./version');
let fileUtils = require('./file');
let tool = require('./tool');
let fsReadFiles = require('./fsReadFiles');

let utils = {
  fsReadFiles
};

utils = Object.assign(utils, versionUtils, fileUtils, tool);

module.exports = utils;
