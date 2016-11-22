/*MOCHA TEST*/
var winstonConfigExtended = require('../../index.js'),
    path = require('path'),
    assert = require('assert');

describe('winston-config-extended', function () {
    it('works', function (done) {

        function testLoggers(prefix, winstonLoggers){
            prefix = prefix || '';
            var consoleKeys = Object.keys(console);
            assert.doesNotThrow(function(){
                winstonConfigExtended.hookConsole(winstonLoggers.get('web'));
                console.error(prefix+'Test error');
                console.warn(prefix+'Test warn');
                console.info(prefix+'Test info');
                console.debug(prefix+'Test debug');
                console.verbose(prefix+'Test verbose');
                console.all('Test all');
                console.none('Test all');
            });
            assert.throws(function(){
                winstonConfigExtended.restoreConsole();
                console.debug(prefix + 'Test debug');
                console.verbose(prefix + 'Test verbose');
                console.all('Test all');
                console.none('Test all');
            });
            assert.equal(consoleKeys.length, Object.keys(console).length);
            done();
        }

        /*Promise*/
        winstonConfigExtended.fromFile(path.join(__dirname, '../config/winston-config.json')).then(testLoggers.bind(this, 'Promise: ')).catch(assert.ifError);
    });
});