//
//  log-controller.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//

var lc = module.exports;
var Config = require('app-server/config');
var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;

lc.LogController = (function()
{
  return {
    initLoggers: function(logLevel)
    {
      logLevel = logLevel || 'info';

      var transports = [
        new (winston.transports.File)({
          colorize: true,
          level: logLevel,
          filename: 'logs/ss-account-server.log',
          handleExceptions: true
        }),
        new (winston.transports.Console)({
          colorize: true,
          level: logLevel,
          handleExceptions: true
        })
      ];

      if (Config.graylog2)
      {
        transports.push(Graylog2, {
          level: logLevel,
          graylogHost: Config.graylog2.host,
          graylogPort: Config.graylog2.port
        });
      }

      var logger = new (winston.Logger)({
        transports: transports,
        exitOnError: false
      });

      logger.setLevels(winston.config.syslog.levels);
      lc.logger = logger;
      return logger;
    }
  };
})();
