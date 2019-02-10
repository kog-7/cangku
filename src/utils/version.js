let inquirer = require('inquirer');
let chalk = require('chalk');
let nodepath = require('path');
let fs = require('fs-extra');
let fileUtils = require('./file');
let fsReadFiles = require('./fsReadFiles');
let tool = require('./tool');

let versionComputer = (v1, v2) => {
  let v1arr = v1.split('.');
  let v2arr = v2.split('.');
  let v1no = v1arr[0] * 10000 + v1arr[1] * 100 + v1arr[2];
  let v2no = v2arr[0] * 10000 + v2arr[1] * 100 + v2arr[2];
  return v1no - v2no;
};

let maxVersion = (list) => {
  if (list.length === 0) {
    return;
  }
  let out = [];
  list.forEach((v) => {
    let arr = v.split('.');
    let no = 0;
    arr.forEach((num, ind) => {
      num = +num;
      if (isNaN(num)) {
        num = 0;
      }
      if (ind === 0) {
        no += 10000 * num;
      } else if (ind === 1) {
        no += 100 * num;
      } else if (ind === 2) {
        no += 1 * num;
      }
    });

    out.push(no);
  });

  let max = Math.max(...out);
  let ind = out.indexOf(max);
  return list[ind];
};

let versionType = function(version, oldVersion) {
  let v1arr = version.split('.');
  let v2arr = oldVersion.split('.');
  if (v1arr[0] !== v2arr[0]) {
    return 'high';
  }
  if (v1arr[1] !== v2arr[1]) {
    return 'middle';
  }
  if (v1arr[2] !== v2arr[2]) {
    return 'low';
  }
  return false;
};

let versionChange = function(source, dist) {
  return new Promise((resolve, reject) => {
    // let sourceUrl = nodepath.join(rootUrl, "./sources");
    let sourceUrl = source;
    let aimDir = dist;

    // let aimDir = nodepath.join(rootUrl, "./versions/store", version);

    try {
      fs.statSync(aimDir);
    } catch (e) {
      tool.noConsole(`${aimDir} is not exit in store,pls fix`);
      return;
    }

    let msg = [];

    fsReadFiles(sourceUrl, {
      exclude: [/node_modules/gm],
      filter: function({ path, size, mime }) {
        return new Promise((resolve, reject) => {
          let relativePath = nodepath.relative(sourceUrl, path);
          let newFile = path;
          let oldFile = nodepath.join(aimDir, relativePath);
          try {
            let stats = fs.statSync(newFile);
            if (stats.isDirectory()) {
              resolve();
              return;
            }
          } catch (e) {
            resolve();
          }
          fileUtils
            .compareFile(newFile, oldFile, source)
            .then((info) => {
              if (info) {
                msg.push(info);
              }
              resolve();
            })
            .catch(() => {
              resolve();
            });
        });
      }
    })
      .then(() => {
        fsReadFiles(aimDir, {
          exclude: [/node_modules/gm],
          filter: function({ path, size, mime }) {
            return new Promise((resolve, reject) => {
              let relativePath = nodepath.relative(aimDir, path);
              let newUrl = nodepath.join(sourceUrl, relativePath);

              try {
                fs.statSync(newUrl);
              } catch (e) {
                msg.push(`delete : ${relativePath}`);
                resolve();
                return;
              }
              resolve();
            });
          }
        })
          .then(() => {
            resolve(msg);
          })
          .catch(() => {});
      })
      .catch(() => {});
  });
};

let askVersion = function(askMsg) {
  //must lower than ,must
  return new Promise((resolve, reject) => {
    inquirer
      .createPromptModule()({
        name: 'confirm',
        message: askMsg
      })
      .then((out) => {
        let confirm = out.confirm;
        resolve(confirm);
      });
  });
};

let isVersion = (v) => {
  let varr = v.split('.');
  if (varr.length === 0) {
    return false;
  }
  for (let no of varr) {
    let newNo = +no;
    if (isNaN(newNo)) {
      return false;
    }
  }
  return true;
};

module.exports = {
  maxVersion,
  askVersion,
  versionComputer,
  isVersion,
  versionType,
  versionChange
};
