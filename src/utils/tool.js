let chalk = require('chalk');
let yesConsole = (msg) => {
  console.log(chalk.green(msg));
};
let noConsole = (msg) => {
  console.log(chalk.red(msg));
};

let arrayRemoveItem = (arr, item) => {
  let out = [].concat(arr);
  let ind = out.indexOf(item);
  if (ind === -1) {
    return false;
  }
  out.splice(ind, 1);
  return out;
};
module.exports = {
  yesConsole,
  noConsole,
  arrayRemoveItem
};
