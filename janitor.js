'use strict';

// TODO: check out https://www.npmjs.com/package/semver

let chalk = require('chalk');
let fs = require('fs');
let path = require('path');
let pkg = require(path.join(__dirname, 'package.json'));
let program = require('commander');

let output = require('./output');
let jspmStrategy = require('./jspm-read-strategy');

program
    .version(pkg.version)
    .option('-p, --path <path>', 'path to the project to analyze (defaults to ".")')
    .parse(process.argv);

let projectPath = program.path || '.';

console.log(output.info('janitor ' + pkg.version + ' running in path ' + projectPath));

fs.readFile(path.join(projectPath, 'package.json'), (err, data) => {
    if (err) {
        throw err;
    }
    let project = JSON.parse(data);
    console.log('analyzing ' + project.name + ' ' + project.version);
    console.log('');
    
    if (project.jspm) {
        console.log(output.info('project is using jspm'));
        console.log('');
        jspmStrategy.readJspmProject(project, projectPath);
    } else {
        console.log('project is not using jspm');
    }
});
