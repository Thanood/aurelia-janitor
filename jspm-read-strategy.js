'use strict';

let fs = require('fs');
let path = require('path');

let output = require('./output');

let readJspmDependency = (index, alias, dep) => {
    let tokens = dep.split(':');
    let registry = tokens[0];
    let pkgName = tokens[1];
    
    if (!pkgName) {
        pkgName = registry;
        registry = 'jspm';
    }
    
    let pkgTokens = pkgName.split('@');
    let pkg = pkgTokens[0];
    let version = pkgTokens[1];
    
    return {
        index,
        alias,
        registry,
        pkg,
        version
    }
};

let readConfig = (config, topLevelDependencies) => {
    console.log('');
    console.log('config dependencies:');
    let configDependencies = [];
    for (let index in topLevelDependencies) {
        let dep = topLevelDependencies[index];
        let dependency = config.map[dep.alias];
        if (dependency) {
            let resolvedDependency = readJspmDependency(index, dep.alias, dependency);
            configDependencies.push(resolvedDependency);
            console.log(output.info("[%s] ") + "%s - registry: %s, pkg: %s, version: %s", resolvedDependency.index, resolvedDependency.alias, resolvedDependency.registry, resolvedDependency.pkg, resolvedDependency.version);
        } else {
            console.log(output.warn('WARNING:') + 'alias from package.json not found in config.js: %s', dep.alias);
        }
    }
    return configDependencies;
};

function readJspmProject(project, projectPath) {
    console.log('top level dependencies:');
    let topLevelDeps = project.jspm.dependencies;
    let topLevelDependencies = [];
    let index = 0;
    for (let dep in topLevelDeps) {
        let dependency = readJspmDependency(index++, dep, topLevelDeps[dep]);
        topLevelDependencies.push(dependency);
        console.log(output.info("[%s] ") + "%s - registry: %s, pkg: %s, version: %s",  dependency.index, dependency.alias, dependency.registry, dependency.pkg, dependency.version);
    }
    
    let _originalSystem = global.System;
    let config = null;
    global.System = {
        config: (cfg) => {
            config = cfg;
        }
    };
    require(path.join(projectPath, 'config.js'));
    global.System = _originalSystem;
    let configDependencies = readConfig(config, topLevelDependencies);
}

module.exports = {
    readJspmProject
};
