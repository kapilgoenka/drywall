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
    _ = require('underscore');

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
  function Workflow(request, response)
  {
    var self = this;

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
      response.send(self.outcome);
    });
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
