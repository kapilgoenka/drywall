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
      self.outcome.success = !self.hasErrors();

      log.info('success: ' + self.outcome.success);

      if (self.hasErrors())
      {
        if (_.size(this.outcome.errfor) !== 0)
          log.error(JSON.stringify(self.outcome.errfor));
        else if (this.outcome.errors.length !== 0)
          log.error(JSON.stringify(self.outcome.errors));
      }

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
      log.info(workflowName);

    if (request.user)
      log.debug('Logged in as user: ' + request.user.username);
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
