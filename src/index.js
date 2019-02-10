const nodepath = require('path');
const chalk = require('chalk');
require('map-path').setRoot(nodepath.join(__dirname, '../'));
const compareV = require('compare-versions');
const program = require('commander');
// const main = require("./index.js");

const fs = require('fs-extra');
let appUrl = require('map-path')('App', 'url');
let utils = require('map-path')('Utils');

let config = require('map-path')('Services/config');

class Tank {
  constructor(source, dist, lock) {
    this.source = source;
    this.dist = dist;
    this.lock = lock;
    this.option = {
      low: {
        console: true,
        ask: false
      },
      middle: {
        console: true,
        ask: true
      },
      high: {
        console: true,
        ask: true
      }
    };
  }
  handle(version, oldVersion, msg) {
    let type = utils.versionType(version, oldVersion);
    let { lock } = this;
    let { option } = this;
    return new Promise((resolve, reject) => {
      if (['high', 'low', 'middle'].indexOf(type) !== -1) {
        if (lock === 'high' && type === 'high') {
          reject();
          return;
        }
        if (lock === 'middle' && type !== 'low') {
          reject();
          return;
        }

        let info = option[type];

        if (info.console === true) {
          utils.yesConsole(`what changed in new Vesion: \n ${msg.join('\n')}`);
        }

        if (info.ask === true) {
          utils
            .askVersion(
              `are you sure to upgrade from ${oldVersion} to ${version}`
            )
            .then((confirm) => {
              if (confirm === 'yes') {
                resolve();
              } else {
                reject('no');
              }
            });
        } else {
          resolve();
        }
      }
    });
  }
  setRank(opt) {
    if (typeof opt !== 'object') {
      return;
    }
    this.option = Object.assign(this.option, opt);
  }
  setLock(lock) {
    this.lock = lock;
  }
  prePull() {
    let { lock } = this;
    if (lock === true || lock === 'low') {
      return false;
    } else {
      return true;
    }
  }
  pull() {
    let { source, dist, option } = this;
    let obj;
    let packageUrl = nodepath.join(source, './package.json');
    let distPackageUrl = nodepath.join(dist, './package.json');
    try {
      fs.statSync(packageUrl);
      obj = fs.readJsonSync(packageUrl);
      if (obj.engine !== config.name) {
        throw `don't see right engine in source package.json,not a valid cangku dir`;
      }
    } catch (e) {
      throw e;
    }
    return new Promise((resolve, reject) => {
     
      let { name, version } = obj;
      if(version==='0.0.0'){
        utils.yesConsole(`no version can be used,pls push a new version`);
        return;
      }
      let srcDir = nodepath.join(source, 'versions/store', version);
      let distDir = nodepath.join(dist, 'src');
      let oldObj;

      try{
        fs.statSync(srcDir)
      }
      catch(e){
        utils.noConsole(`${version} is not exit`);
        resolve();
        return;
      }

      try {
        fs.statSync(distPackageUrl);
      } catch (e) {
        //new copy
        fs.copySync(srcDir, distDir);
        fs.copySync(packageUrl, nodepath.join(dist, 'package.json'));
        utils.yesConsole(`${version} is created`);
        //first import
        resolve();
        return;
      }


      let ifPull = this.prePull();

      if (ifPull === false) {
        resolve();
        return;
      }


      oldObj = fs.readJsonSync(distPackageUrl);
      let { version: oldVersion } = oldObj;
      if (compareV(version, oldVersion) !== 1) {
        resolve();
        return;
      }
      utils
        .versionChange(srcDir, distDir)
        .then((msg) => {
          if (msg.length === 0) {
            utils.noConsole(
              `no change in new ${version},source have push a invalid package`
            );
            resolve();
            return;
          }

          this.handle(version, oldVersion, msg)
            .then(() => {
              fs.removeSync(distDir);
              fs.ensureDirSync(distDir);
              fs.copySync(srcDir, distDir);
              oldObj.version = version;

              fs.writeJsonSync(distPackageUrl, oldObj);
              utils.yesConsole(`upgrade success`);
              resolve();
            })
            .catch((err) => {
              if (err) {
                console.log(`no upgrade`);
              }
              resolve();
            });
        })
        .catch((err) => {
          resolve();
        });
    });
  }
  async push() {
    let obj;
    let { source } = this;
    let packageUrl = nodepath.join(source, './package.json');
    try {
      fs.statSync(packageUrl);
      obj = fs.readJsonSync(packageUrl);
      if (obj.engine !== config.name) {
        throw `don't see right engine in package.json,not a valid cangku dir`;
      }
    } catch (e) {
      throw e;
    }
    let { name, version } = obj;
    let newVersion = await utils.askVersion(
      `${chalk.green(
        `current version is ${version}`
      )}:input your new version to upgrade?`
    );

    if (compareV(newVersion, version) !== 1) {
      utils.noConsole(
        `you need to input a higher version,your input is ${newVersion}`
      );
      return;
    }
    let msg = await utils.versionChange(
      nodepath.join(source, 'sources'),
      nodepath.join(source, `versions/store/${version}`)
    );

    if (msg.length === 0) {
      utils.noConsole(`no change in sources,can't create ${newVersion}`);
      return;
    }

    utils.yesConsole(`changed in ${newVersion} : \n ${msg.join('\n')}`);
    if (!newVersion) {
      return;
    }
    try {
      fs.copySync(
        nodepath.join(source, 'sources'),
        nodepath.join(source, `versions/store/${newVersion}`)
      );
      obj.version = newVersion;
      fs.writeJson(packageUrl, obj);
      utils.yesConsole(`${newVersion} is created`);
    } catch (e) {
      utils.noConsole(e);
    }
  }
}

let tank = function(...props) {
  return new Tank(...props);
};

module.exports = tank;
