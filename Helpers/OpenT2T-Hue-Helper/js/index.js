'use strict';

var https = require('https');
var q = require('q');

//this is our base, we refactor these options in each method

var protocolVal = 'https:';
var hostVal = "api.meethue.com";
var  accessToken, apiPath;  //we will need this when creating the headers
      
function isLightState(apiField)
{
    switch (apiField){
        case "on":
        case "bri":
        case "hue":
        case "sat":
        case "xy":
        case "ct":
        case "alter":
        case "effect":
        case "colormode":
        case "reachable":
            return true;
            break;
        default:
            return false;
    }
    return false;
}
 
module.exports = 
{
    //get the initial parameters to build our target endpoint
   initHueApi: function(token, bridgeId, whitelistId, deviceType, deviceId)
   {      
       apiPath =  '/v2/bridges/' + bridgeId + '/' + whitelistId + '/' + deviceType + '/' + deviceId;
       accessToken = token; //the specific token       
   },
 
   sendDesiredStateCommand: function(apiField,value) 
   {   
    
    var options = 
    {
        protocol: protocolVal,
        host: hostVal,
        path: apiPath,
        method: 'PUT'
    };

    if(isLightState(apiField)){
        options.path += '/state';
    } 
    
    //build a data payload where the apiField is the target value
    options.postData = {}; //we will add the field in this object
    options.postData[apiField] = value;
    
    var deferred = q.defer();   // q will help us with returning a promise
    
    //the headers to make our call
    options.headers = 
    {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-length':  JSON.stringify(options.postData).length
    }
   
    //our HTTPS call 
    var req = https.request(options, (res) => {
        res.setEncoding('utf8');
        var body = ''; //holds the chunks of data
        res.on('data', (chunk) => 
        {
            body += chunk;
        });
        res.on('end', () => 
        {
            if(body.includes("success")){
                deferred.resolve('The ' + apiField + ' changed to ' + value);
            }else{
                var e =
                {
                    message: body
                };
                deferred.reject(e);  
            }
        });
        res.on('error', (e) => {
            deferred.reject(e);
        }); 
    });


    req.on('error', (e) => {
        console.log('problem with request:');
        deferred.reject(e);
    });

    req.write(JSON.stringify(options.postData));
    req.end();   

    //make our Promise and give it back to the caller
    return deferred.promise;
   },
   
   getLastReading: function(apiField)
   {
    
    var options = 
    {
        protocol: protocolVal,
        host: hostVal,
        path: apiPath     
    };

    var deferred = q.defer();   // q will help us with returning a promise
    
    //the headers to make our call
    options.headers = 
    {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json', 
    }
     
    //our HTTPS call 
    var req = https.get(options, (res) => {
     
        var body = ''; //holds the chunks of data
        res.on('data', (chunk) => 
        {
          body += chunk; 
        });
        res.on('end', () => 
        {
            //parse the JSON response and look for the apiField we want in the JSON body
            try
            {
                var results = JSON.parse(body.toString());
                var valueToGet;
                if(isLightState(apiField)){
                    valueToGet = results.state[apiField];
                }else{
                    valueToGet = results[apiField];
                }
                deferred.resolve(valueToGet);
            } catch(err) 
            {
                deferred.reject(err);
            }

        });
        res.on('error', (e) => {
            deferred.reject(e);
        }); });

    req.on('error', (e) => {
        console.log('problem with request:');
        deferred.reject(e);
    });
       
    req.end();   
    //make our Promise and give it back to the caller
    return deferred.promise;
    
   }
}
    

 
