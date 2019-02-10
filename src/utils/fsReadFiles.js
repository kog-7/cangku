let fs = require('fs-extra');
let nodepath = require('path');
let explore = require('./explore.js');
var mimeTypes = require('mime-types');

let checkFileType = (url) => {
  return new Promise((resolve, reject) => {
    fs.stat(url, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      let mime = mimeTypes.lookup(url);

      if (stats.isDirectory()) {
        resolve({ type: 'dir', path: url });
      } else if (stats.isFile()) {
        resolve({
          type: 'file',
          path: url,
          size: stats.size,
          mime
        });
      } else {
        resolve({
          type: 'other',
          path: url,
          size: stats.size,
          mime
        });
      }
    });
  });
};

let readDir = (path) => {
  return new Promise((resolve, reject) => {
    let out = [];
    fs.readdir(path, (err, dirs) => {
      if (err) {
        reject(err);
        return;
      }
      dirs.forEach((ph, ind) => {
        out.push(nodepath.join(path, ph));
      });
      resolve(out);
    });
  });
};

let fsReadFiles = (url, { filter, exclude, include }) => {
  return new Promise((resolve, reject) => {
    let exp = new explore();

    exp
      .setCallback(() => {
        resolve();
      })
      .setError((err) => {
        reject(err);
      })
      .parse((val, lastVal) => {
        //lastVal是解析过的val,resolve数组就继续下一次的运行，否则开始回溯,val为当前的内容，可以为字符串等等。
        return new Promise(function(resolve, reject) {
          checkFileType(val)
            .then((data) => {
              let { type, path, size, mime } = data;
              if (url !== path) {
                if (Array.isArray(exclude)) {
                  for (let val of exclude) {
                    if (typeof val === 'string' && path.indexOf(val) !== -1) {
                      resolve();
                      return;
                    } else if (typeof val === 'object' && val.test(path)) {
                      //not t reg,after
                      resolve();
                      return;
                    }
                  }
                }

                if (Array.isArray(include)) {
                  for (let val of include) {
                    if (typeof val === 'string' && path.indexOf(val) === -1) {
                      //empty and reture
                      resolve();
                      return;
                    } else if (typeof val === 'object' && !val.test(path)) {
                      resolve();
                      return;
                    }
                  }
                }
              }

              let outRun = function() {
                if (type === 'dir') {
                  readDir(path)
                    .then((arr) => {
                      resolve(arr);
                    })
                    .catch((err) => {
                      console.log(err);
                      resolve();
                    });
                } else {
                  resolve();
                }
              };

              if (typeof filter === 'function') {
                let out = filter(data);
                if (typeof out === 'object' && typeof out.then === 'function') {
                  out
                    .then(() => {
                      outRun();
                    })
                    .catch(() => {
                      outRun();
                    });
                } else {
                  outRun();
                }
              } else {
                outRun();
              }
            })
            .catch((err) => {
              resolve();
            });
        });
      })
      .run({
        input: url
      });
  });
};

module.exports = fsReadFiles;

// fsReadFiles(nodepath.join(__dirname,'../routes'));
