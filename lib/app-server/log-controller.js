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
var Graylogger = require('winston-graylogger');

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
        })
      ];

      var logger = new (winston.Logger)({
        transports: transports,
        exitOnError: false
      });

      if (Config.graylog2)
      {
        logger.add(winston.transports.Graylog2, {
          host: Config.graylog2.host,
          port: Config.graylog2.port
        });
      }

      logger.setLevels(winston.config.syslog.levels);
      lc.logger = logger;
      return logger;
    }
  };
})();
