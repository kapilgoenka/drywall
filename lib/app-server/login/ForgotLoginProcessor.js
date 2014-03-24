//
//  ForgotLoginProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var ForgotLoginProcessor = module.exports;

var App = require('app').app,
    crypto = require('crypto'),
    wf = require('app-server/common/Workflow'),
    EmailSender = require('app-server/common/EmailSender'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the forgot login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response
 */
ForgotLoginProcessor.init = function(request, response)
{
  // Are we logged in?
  if (request.isAuthenticated())
    response.redirect(App.defaultReturnUrl(request.user));
  else
    response.render('login/forgot/index');
};

/*******************************************************************************
 * send
 *******************************************************************************
 * Send a reset password email to a user.
 *
 * Inputs:
 *   request, response
 */
ForgotLoginProcessor.send = function(request, response)
{
  function validate()
  {
    if (!request.body.email)
    {
      workflow.outcome.errfor.email = 'required';
      return workflow.emit('response');
    }

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    // Create new reset token.
    var token = crypto.createHash('md5').update(Math.random().toString()).digest('hex');

    // Find the user with that email and patch.
    RiakDBAccessor.findAndUpdate('users', { email: request.body.email }, { resetPasswordToken: token }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('Email address not found.');
        return workflow.emit('response');
      }

      workflow.emit('sendEmail', token, user);
    } );
  }

  function sendEmail(token, user)
  {
    EmailSender.email(request, response,
    {
      from: request.app.get('email-from-name') + ' <' + request.app.get('email-from-address') + '>',
      to: user.email,
      subject: 'Reset your ' + request.app.get('project-name') + ' password',
      htmlPath: 'login/forgot/email-html',

      locals:
      {
        username: user.username,
        resetLink: 'http://' + request.headers.host + '/login/reset/' + token + '/',
        projectName: request.app.get('project-name')
      },

      success: function(message)
      {
        workflow.emit('response');
      },

      error: function(error)
      {
        workflow.outcome.errors.push('Error Sending: ' + error);
        workflow.emit('response');
      }
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Send Password Reset' });
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.on('sendEmail', sendEmail);
  workflow.emit('validate');
};
