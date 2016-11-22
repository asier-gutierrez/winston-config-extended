var WinstonConfig = require('..');

function testLoggers(prefix, winstonLoggers){
    prefix = prefix || '';
    /*var winstonLogger = winstonLoggers.get('default');
    winstonLogger.error(prefix+'Test error');
    winstonLogger.warn(prefix+'Test warn');
    winstonLogger.info(prefix+'Test info');
    winstonLogger.debug(prefix+'Test debug');
    winstonLogger.verbose(prefix+'Test verbose');
    winstonLogger.all('Test all');
    winstonLogger.none('Test all');

    var webLogger = winstonLoggers.get('web');
    webLogger.error(prefix+'Web test error');
    webLogger.warn(prefix+'Web test warn');
    webLogger.info(prefix+'Web test info');
    webLogger.debug(prefix+'Web test debug');
    webLogger.verbose(prefix+'Web test verbose');
    webLogger.all(prefix+'Web test all');
    webLogger.none(prefix+'Web test all');*/

    WinstonConfig.hookConsole(winstonLoggers.get('default'));

    console.error(prefix+'Test error');
    console.warn(prefix+'Test warn');
    console.info(prefix+'Test info');
    console.debug(prefix+'Test debug');
    console.verbose(prefix+'Test verbose');
    console.all('Test all');
    console.none('Test all');

    WinstonConfig.restoreConsole();

    try {
        console.debug(prefix + 'Test debug');
        console.verbose(prefix + 'Test verbose');
        console.all('Test all');
        console.none('Test all');
    }catch(e){
        console.info('unhooked!')
    }

}

/*Promise*/
WinstonConfig.fromFile().then(testLoggers.bind(this, 'Promise: '));
/*Callback*/
/*WinstonConfig.fromFile('', function(error, winstonLoggers){
    testLoggers('Callback: ', winstonLoggers);
});*/
/*Synchronous*/
//testLoggers('Sync: ', WinstonConfig.fromFileSync());