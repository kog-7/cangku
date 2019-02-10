const fs = require('fs-extra');
const streamEqual = require('stream-equal');
const nodepath = require('path');

let compareFile = (newUrl, oldUrl, rootUrlSource) => {
  let status = '';
  return new Promise((resolve, reject) => {
    if (!(typeof newUrl === 'string' && typeof oldUrl === 'string')) {
      reject('type error');
      return;
    }
    try {
      fs.statSync(oldUrl);
    } catch (e) {
      resolve(`created : ${nodepath.relative(rootUrlSource, newUrl)}`);
      return;
    }

    let readNew = fs.createReadStream(newUrl);
    let readOld = fs.createReadStream(oldUrl);
    streamEqual(readNew, readOld, (err, equal) => {
      if (equal !== true) {
        resolve(`changed : ${nodepath.relative(rootUrlSource, newUrl)}`);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  compareFile
};
