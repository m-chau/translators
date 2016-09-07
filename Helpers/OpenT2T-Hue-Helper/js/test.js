'user strict';

var testConfig = require('./testConfig');
var hh = require('./index');

hh.initHueApi(testConfig.accessToken, testConfig.bridgeId, testConfig.whitelistId, testConfig.deviceType, testConfig.deviceId);

hh.sendDesiredStateCommand('on', true).then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging
 
hh.sendDesiredStateCommand('bri', 48).then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging

hh.getLastReading('name').then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging

hh.getLastReading('bri').then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging

hh.getLastReading('on').then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging

hh.sendDesiredStateCommand('on', false).then(result => {
   console.log(result);
}).catch (error => {
    console.log(error.message);
}); //for logging