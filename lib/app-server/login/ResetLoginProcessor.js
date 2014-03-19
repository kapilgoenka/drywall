//
//  ResetLoginProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var ResetLoginProcessor = module.exports,
    App = require('app').app,
    wf = require('app-server/common/Workflow'),
    crypto = require('crypto'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the reset login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response
 */
ResetLoginProcessor.init = function(request, response)
{
  // Are we logged in?
  if (request.isAuthenticated())
    response.redirect(App.defaultReturnUrl(request.user));
  else
    response.render('login/reset/index');
};

/*******************************************************************************
 * set
 *******************************************************************************
 * Set a new password for a user.
 *
 * Inputs:
 *   request, response
 */
ResetLoginProcessor.set = function(request, response)
{
  function validate()
  {
    if (!request.body.password)
      workflow.outcome.errfor.password = 'required';

    if (!request.body.confirm)
      workflow.outcome.errfor.confirm = 'required';

    if (request.body.password !== request.body.confirm)
      workflow.outcome.errors.push('Passwords do not match.');

    // Return if we have errors already.
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    // Encrypt password.
    var encryptedPassword = App.encryptPassword(request.body.password);

    RiakDBAccessor.findAndUpdate('users', { resetPasswordToken: request.params.token }, { password: encryptedPassword, resetPasswordToken: '' }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('Invalid reset token.');
        return workflow.emit('response');
      }

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};
