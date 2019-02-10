#!/usr/bin/env node
'use strict';

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

let cwd = process.cwd();
// const libCwd = nodepath.join(__dirname,"..");

program.command('create <appName>').action(function (appName, cmd) {
  let distUrl = nodepath.join(cwd, appName);
  let distPackUrl = nodepath.join(distUrl, 'package.json');
  let obj = fs.readJsonSync(nodepath.join(appUrl, 'package.json'));
  obj.name = appName;
  fs.copy(appUrl, nodepath.join(cwd, appName)).then(() => {
    fs.writeJsonSync(distPackUrl, obj);
    utils.yesConsole(`${appName} is created`);
  });
});

program.command('remove').action(async function (appName, cmd) {
  let obj;
  let packageUrl = nodepath.join(cwd, './package.json');
  let aimDir = nodepath.join(cwd, 'versions/store');
  try {
    fs.statSync(packageUrl);
    obj = fs.readJsonSync(packageUrl);
    if (obj.engine !== config.name) {
      throw `don't see right engine in package.json,not a valid cangku dir`;
    }
  } catch (e) {
    throw e;
  }
  let list = fs.readdirSync(aimDir);

  let oldVersion = await utils.askVersion(
    `pls input version you want to remove,exit version is ${chalk.green(
      list.join(',')
    )}`,
    `must remove a exit version`
  );

  let dir = nodepath.join(aimDir, oldVersion);
  try {
    fs.statSync(dir);
    fs.remove(dir);
    let { version } = obj;

    if (version === oldVersion) {
      let newList = utils.arrayRemoveItem(list, version);

      if (Array.isArray(newList)) {
        let max = utils.maxVersion(newList);

        max = max || '0.0.0';
        obj.version = max;
        fs.writeJsonSync(packageUrl, obj);
      }
    }
  } catch (e) {
    utils.noConsole(`don't have ${oldVersion} in store`);
    return;
  }
  utils.yesConsole(`${oldVersion} is removed`);
});

program.command('push').action(async function () {
  let obj;
  let packageUrl = nodepath.join(cwd, './package.json');
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


  let msg;

  if(version === "0.0.0") {
    msg = [`first version create`];
  }
  else {
    msg = await utils.versionChange(
      nodepath.join(cwd, 'sources'),
      nodepath.join(cwd, `versions/store/${version}`)
    );
  }


  if (msg.length === 0) {
    utils.noConsole(`no change in sources,can't create ${newVersion}`);
    return;
  }
  utils.yesConsole(`${msg.join('\n')}`);
  if (!newVersion) {
    return;
  }
  try {
    fs.copySync(
      nodepath.join(cwd, 'sources'),
      nodepath.join(cwd, `versions/store/${newVersion}`)
    );
    obj.version = newVersion;
    fs.writeJson(packageUrl, obj);
    utils.yesConsole(`${newVersion} is created`);
  } catch (e) {
    utils.noConsole(e);
  }
});

program.parse(process.argv);
