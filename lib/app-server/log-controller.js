//
//  log-controller.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var lc = module.exports;

var CONFIG = require('app-server/config');
var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;

lc.LogController = (function()
{
  var defaultLogger = null;

  return {
    initLoggers: function(logLevel)
    {
      logLevel = logLevel || 'info';

      var loggers =
      {
        console:
        {
          colorize: true,
          level: logLevel,
          handleExceptions: true
        },

        file:
        {
          colorize: true,
          level: logLevel,
          filename: 'logs/ss-account-server.log',
          handleExceptions: true
        }
      };

      if (CONFIG.graylog2)
      {
        console.log('Adding Graylog2: ', CONFIG.graylog2);
        loggers.Graylog2 =
        {
//          colorize: true,
          level: logLevel,
          graylogHost: CONFIG.graylog2.host,
          graylogPort: CONFIG.graylog2.port
        };
      }
      else
        console.log('Graylog2 not configured');

      defaultLogger = winston.loggers.add( 'ss-account-default', loggers);

      defaultLogger.setLevels(winston.config.syslog.levels);
      defaultLogger.exitOnError = false;

      return defaultLogger;
    }
  };
})();
