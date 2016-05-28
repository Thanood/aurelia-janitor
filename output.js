'use strict';

let chalk = require('chalk');

function info(msg) {
    return chalk.bold.cyan(msg);
}
function warn(msg) {
    return chalk.bold.yellow(msg);
}

module.exports = {
    info,
    warn
};
