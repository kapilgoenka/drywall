//
//  cors.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var Config = require('app-server/config'),
    SSUtil = require('app-server/common/SSUtil'),
    ApiError = require('ss-util/lib/api-error-response'),
    os = require("os"),
    winston = require('winston'),
    log = winston.loggers.get('ss-account-default');

//CORS middleware

function getCrossDomainConfig()
{
  var crossDomainConfig = Config.crossDomain;

  for (var key in crossDomainConfig.accessControl)
  {
    // Replace '_' with '-'.  Yaml keys cannot contain '-'s
    var value = crossDomainConfig.accessControl[key];
    delete crossDomainConfig.accessControl[key];
    key = key.replace(/_/g, '-');
    crossDomainConfig.accessControl[key] = value;
  }

  crossDomainConfig.allowedOrigins = SSUtil.arrayAsMap(crossDomainConfig.allowedOrigins);
  crossDomainConfig.allowedHosts = SSUtil.arrayAsMap(crossDomainConfig.allowedHosts);

  // Get the ip address according to the os, and add it to the allowed hosts.
  var eth = os.networkInterfaces().eth0;
  if (eth)
  {
    var host = eth[0].address + ":" + Config.port;
    log.info('Adding: ' + host + ' to allowedHosts');
    crossDomainConfig.allowedHosts[host] = true;
  }

  return crossDomainConfig;
}

var crossDomainConfig = getCrossDomainConfig();
//log.debug(JSON.stringify(crossDomainConfig));

function isAllowedHost(host)
{
  // Check allowed domain suffix
  if (host.indexOf(crossDomainConfig.allowedDomainSuffix) !== -1)
    return true;

  // Check allowed hosts
  if (crossDomainConfig.allowedHosts[host])
    return true;

  // Check for localhost
  if (crossDomainConfig.allowLocalHost && host.indexOf('localhost') !== -1)
    return true;

  return false;
}

function isAllowedOrigin(origin)
{
  // Check allowed domain suffix
  if (origin.indexOf(crossDomainConfig.allowedDomainSuffix) !== -1)
    return true;

  // Check allowed origins
  if (crossDomainConfig.allowedOrigins[origin])
    return true;

  return false;
}

module.exports = function(request, response, next)
{
  // Add other domains you want the server to give access to
  // WARNING - Be careful with what origins you give access to

  var origin = request.headers.origin;
  var host = request.headers.host;

  if ( (origin && isAllowedOrigin(origin)) || (host && isAllowedHost(host)) )
  {
    if (origin)
      response.header( 'Access-Control-Allow-Origin', origin );

    for (var key in crossDomainConfig.accessControl)
      response.header( key, crossDomainConfig.accessControl[key] );

//    response.header( 'Access-Control-Allow-Credentials', true );
//    response.header( 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS' );
//    response.header( 'Access-Control-Allow-Headers', 'x-evri-authtoken, x-ss-app-version, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' );
//    response.header( 'Access-Control-Expose-Headers', 'x-evri-authtoken');
    next();
  }
  else
  {
    log.debug('Invalid domain: ', + SSUtil.inspect({origin: origin, host: host}));
    var error = new Error();
    error.status = 401;
    error.errorMessage = "Invalid domain!";
    return response.send(ApiError(error.status, error));
  }
};
