//
//  Workflow.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var wf = module.exports;

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    SSUtil = require('app-server/common/SSUtil'),
    log = require('app-server/log-controller').logger;

wf.Workflow = (function()
{
  /*******************************************************************************
   * Workflow()
   *******************************************************************************
   * Create a new instance of Workflow.
   *
   * Inputs:
   *   request:
   *
   *   response:
   */
  function Workflow(options)
  {
    var self = this;
    var request = options.request;
    var response = options.response;
    var workflowName = options.name || '';

    function emailErrorReport()
    {
      var emailContent = {};
      emailContent.errfor = self.outcome.errfor;
      emailContent.errors = self.outcome.errors;
      SSUtil.sendEmailReport(request, response, emailContent);
    }

    this.outcome =
    {
      success: false,
      errors: [],
      errfor: {}
    };

    this.on('exception', function(error)
    {
      self.outcome.errors.push('Exception: ' + error);
      return self.emit('response');
    });

    this.on('response', function()
    {
      function logError()
      {
        if (_.size(self.outcome.errfor) !== 0)
        {
          _(self.outcome.errfor).each(function(value, key)
          {
            if (_.isObject(value))
            {
              var logLevel = value.logLevel;

              if (logLevel && log[logLevel])
              {
                log[logLevel](key + ': ' + value.msg);

                if (logLevel === 'warn' || logLevel === 'error')
                  emailErrorReport();

                self.outcome.errfor[key] = value.msg;
              }
            }
            else
            {
              log.error(JSON.stringify(self.outcome.errfor));
              emailErrorReport();
            }
          });
        }
        else if (self.outcome.errors.length !== 0)
        {
          log.error(JSON.stringify(self.outcome.errors));
          emailErrorReport();
        }
      }

      if (self.hasErrors())
        logError();

      self.outcome.success = !self.hasErrors();
      response.send(self.outcome);
    });

    this.emit = function()
    {
      var msg  = arguments[0];

      if (msg !== 'response')
        log.debug(msg);

      EventEmitter.prototype.emit.apply(self, arguments);
    };

    console.log();

    if (workflowName)
      log.info(workflowName + ' ' + (request.user ? '(' + request.user.username + ')' : ''));
  }

  // util.inherits(subclass, superclass)
  util.inherits(Workflow, EventEmitter);

  /*******************************************************************************
   * hasErrors()
   *******************************************************************************
   * Check if this workflow has any errors.
   */
  Workflow.prototype.hasErrors = function()
  {
    return _.size(this.outcome.errfor) !== 0 || this.outcome.errors.length !== 0;
  };

  return Workflow;
})();
