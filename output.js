'use strict';

let chalk = require('chalk');

function _(msg) {
    return chalk.bold.underline.blue(msg);
}
function info(msg) {
    return chalk.bold.cyan(msg);
}
function warn(msg) {
    return chalk.bold.yellow(msg);
}

module.exports = {
    _,
    info,
    warn
};
