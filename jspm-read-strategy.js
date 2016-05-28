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
    let semver = pkgTokens[1];
    let semverPrefix = '';
    let version = semver;
    
    if (semver[0] === '^' || semver[0] === '~') {
        semverPrefix = semver[0];
        version = semver.substring(1);
    }
    
    return {
        index,
        alias,
        registry,
        pkg,
        semver,
        semverPrefix,
        version
    }
};

let readConfig = (config, topLevelDependencies) => {
    let configDependencies = [];
    for (let index in topLevelDependencies) {
        let dep = topLevelDependencies[index];
        let dependency = config.map[dep.alias];
        if (dependency) {
            let resolvedDependency = readJspmDependency(index, dep.alias, dependency);
            configDependencies.push(resolvedDependency);
        } else {
            console.log(output.warn('WARNING:') + 'alias from package.json not found in config.js: %s', dep.alias);
        }
    }
    return configDependencies;
};

function readSecondLevelDependencies(configDependencies, config) {
    // FIXME: needs recursion
    let allSecondLevelDependencies = [];
    configDependencies.forEach(dep => {
        let alias = dep.registry + ':' + dep.pkg + '@' + dep.version;
        let secondLevelDependency = config.map[alias];
        let secondLevelDependencies = [];
        if (secondLevelDependency) {
            // console.log('found dep dep: %s', alias);
            for (var dep in secondLevelDependency) {
                let dependency = readJspmDependency(alias, dep, secondLevelDependency[dep]);
                secondLevelDependencies.push(dependency);
            }
        } else {
            // FIXME: this may as well be a dependency without dependencies
            console.log(output.warn('WARNING:') + 'no dependencies found for %s', alias);
        }
        allSecondLevelDependencies.push(secondLevelDependencies);
    });
    return allSecondLevelDependencies;
}

function readDependenciesOfDependencies(rootDependencies, config) {
    let dependencyMap = { };
    rootDependencies.forEach(rootDep => {
        let alias = rootDep.registry + ':' + rootDep.pkg + '@' + rootDep.version;
        
        console.log('checking deps for ' + alias);
        
        let childDependency = config.map[alias];
        if (childDependency) {
            let childDependencies = [];
            for (let dep in childDependency) {
                // let dependency = config.map[dep];
                let dependency = readJspmDependency(alias, dep, childDependency[dep]);
                childDependencies.push(dependency);
            }
            dependencyMap[alias] = readDependenciesOfDependencies(childDependencies, config);
        } else {
            // end of dependency chain
            // console.log(output.warn('WARNING:') + 'no dependencies found for %s', alias);
            dependencyMap[alias] = null;
        }
    });
    return dependencyMap;
}

function outputDependencies(deps) {
    deps.forEach(dependency => {
        console.log(output.info("[%s] ") + "%s - registry: %s, pkg: %s, semver: %s",  dependency.index, dependency.alias, dependency.registry, dependency.pkg, dependency.semver);
    });
}

function readJspmProject(project, projectPath) {
    let topLevelDeps = project.jspm.dependencies;
    let topLevelDependencies = [];
    let index = 0;
    for (let dep in topLevelDeps) {
        let dependency = readJspmDependency(index++, dep, topLevelDeps[dep]);
        topLevelDependencies.push(dependency);
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
    let secondLevelDependencies = readSecondLevelDependencies(configDependencies, config);
    
    console.log('top level ' + output._('package.json') + ' dependencies:');
    outputDependencies(topLevelDependencies);
    
    console.log('');
    console.log('top level ' + output._('config.js') + ' dependencies:');
    outputDependencies(configDependencies);
    
    console.log('');
    // console.log('all second level deps');
    // secondLevelDependencies.forEach(deps => {
    //    outputDependencies(deps); 
    // });
    let dependencyMap = readDependenciesOfDependencies(configDependencies, config);
    console.log(dependencyMap);
}

module.exports = {
    readJspmProject
};
