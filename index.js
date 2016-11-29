var Promise = require('bluebird'),
    path = require('path'),
    underscore = require('underscore'),
    fs = require('fs'),
    readFile = Promise.promisify(fs.readFile),
    Winston = require('winston'),
    consoleOrigs = {},
    hooked = false,
    defaultTransport = {
        "type": "Console",
        "config": {
            "level": "debug",
            "handleExceptions": true,
            "json": false,
            "colorize": true
        }
    },
    BaseConfig = {
        "default": {
            "transports": [
            ],
            "levels": {
                "all": 6,
                "verbose": 5,
                "debug": 4,
                "info": 3,
                "warn": 2,
                "error": 1,
                "none": 0
            },
            "colors": {
                "all": "white",
                "verbose": "magenta",
                "debug": "cyan",
                "info": "green",
                "warn": "yellow",
                "error": "red",
                "none": "black"
            }
        }
    },
    WinstonConfig = function(){},
    EmptyLogger = function EmptyLogger(){};

var pathResolve = function(fileName){
    fileName = fileName || './config/winston-config.json';
    var extName = path.extname(fileName);
    if(extName != '.json')
        throw new TypeError('Invalid config file type. Config file must be a json');
    return path.resolve(path.dirname(require.main.filename), fileName);
};
var fromJson = function(winstonConfig){
    if(typeof winstonConfig !== 'object')
        throw new TypeError('Invalid config json');
    if(Object.keys(winstonConfig).length == 0) {
        winstonConfig = underscore.extend(BaseConfig, winstonConfig);
    }
    Object.keys(winstonConfig).forEach(function(loggerName){
        var loggerConfig = winstonConfig[loggerName];
        loggerConfig = underscore.extend(BaseConfig.default, loggerConfig);
        if(loggerConfig.transports && loggerConfig.transports.length == 0)
            loggerConfig.transports.push(defaultTransport);
        loggerConfig.transports = loggerConfig.transports.map(function(transport){
            if(transport.type && transport.config)
                return new (Winston.transports[transport.type])(transport.config);
            return transport;
        });
        var logger = new Winston.Logger(loggerConfig);
        /*disable none logger, dummy function*/
        if(logger.none)
            logger.none = function(){};
        Winston.loggers.loggers[loggerName] =  logger;
    });
    return Winston.loggers;
};
var pathResolvePromise = Promise.method(pathResolve),
    fromJsonPromise = Promise.method(fromJson);

WinstonConfig.prototype.fromJson = function(winstonConfig, callback){
    return fromJsonPromise(winstonConfig).nodeify(callback);
};

WinstonConfig.prototype.fromFile = function(fileName, callback){
    return pathResolvePromise(fileName)
    .then(readFile)
    .then(JSON.parse)
    .then(this.fromJson)
    .nodeify(callback)
    .catch(function(error){
        console.log('Error loading winston config file '+fileName);
        console.log(error);
        throw error;
    });
};

WinstonConfig.prototype.fromFileSync = function(fileName){
    return fromJson(JSON.parse(fs.readFileSync(pathResolve(fileName))));
};


function restoreConsole(){
    Object.keys(consoleOrigs).forEach(function(consoleKey){
        if(typeof consoleOrigs[consoleKey] === 'function' || (consoleOrigs[consoleKey] && consoleOrigs[consoleKey] instanceof EmptyLogger)) {
            if(consoleOrigs[consoleKey] instanceof EmptyLogger){
                delete console[consoleKey];
            }else {
                console[consoleKey] = consoleOrigs[consoleKey];
            }
            delete consoleOrigs[consoleKey];
        }
    });
    hooked = false;
}

WinstonConfig.prototype.hookConsole = function(logger){
    if(hooked)
       restoreConsole();
    hooked = true;
    Object.keys(logger.levels).forEach(function(loggerKey){
        if(typeof logger[loggerKey] === 'function') {
            if (typeof console[loggerKey] === 'function') {
                if(!consoleOrigs[loggerKey])
                    consoleOrigs[loggerKey] = console[loggerKey];
            }else{
                consoleOrigs[loggerKey] = new EmptyLogger();
            }
            console[loggerKey] = logger[loggerKey];
        }
    });
};

WinstonConfig.prototype.restoreConsole = restoreConsole;

WinstonConfig.prototype.defaultLevels = BaseConfig.default.levels;
WinstonConfig.prototype.defaultColors = BaseConfig.default.colors;

module.exports = new WinstonConfig();