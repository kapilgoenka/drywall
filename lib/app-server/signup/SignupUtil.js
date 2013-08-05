//
//  SignupUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var SignupUtil = module.exports;

var App = require('app').app,
    _ = require('underscore');
//    winston = require('winston'),
//    log = winston.loggers.get('ss-default');

/*******************************************************************************
 * isValidUsernameFormat(username)
 *******************************************************************************
 * Check if a username has the correct format.
 *
 * Inputs:
 *   username:
 */
SignupUtil.isValidUsernameFormat = function(username)
{
  return /^[a-zA-Z0-9\-\_]+$/.test(username);
};

/*******************************************************************************
 * isValidEmailFormat(email)
 *******************************************************************************
 * Check if an email address has the correct format.
 *
 * Inputs:
 *   email:
 */
SignupUtil.isValidEmailFormat = function(email)
{
  return /^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(email);
};

/*******************************************************************************
 * duplicateEmailCheck()
 *******************************************************************************
 * Check for email already in use.
 *
 * Inputs:
 *   params: { email }
 *
 *   workflow:
 *
 *   nextStep:
 */
SignupUtil.duplicateEmailCheck = function(params, workflow, nextStep)
{
  App.db.models.User.findOne({ email: params.email }, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (user)
    {
      workflow.outcome.errfor.email = 'Email already registered';
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
};

/*******************************************************************************
 * createUser()
 *******************************************************************************
 * Create the user record.
 *
 * Inputs:
 *   createUserParams: { baseParams: { username, password, email }, additionalFields }
 *
 *   workflow:
 *
 *   nextStep:
 */
SignupUtil.createUser = function(createUserParams, workflow, nextStep)
{
  var baseParams = createUserParams.baseParams;

  var userData =
  {
    isActive: 'yes',
    username: baseParams.username,
    email: baseParams.email,
    password: App.db.models.User.encryptPassword(baseParams.password),
    search: [baseParams.username, baseParams.email]
  };

  if (createUserParams.additionalFields)
    _.extend(userData, createUserParams.additionalFields);

  App.db.models.User.create(userData, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.user = user;
    workflow.emit(nextStep);
  });
}

/*******************************************************************************
 * createAccount()
 *******************************************************************************
 * Create an account record linked to the user record.
 *
 * Inputs:
 *   accountData:
 *
 *   workflow:
 *
 *   nextStep:
 */
SignupUtil.createAccount = function(accountData, workflow, nextStep)
{
  App.db.models.Account.create(accountData, function(error, account)
  {
    if (error)
      return workflow.emit('exception', error);

    // Update user with account.
    workflow.user.roles.account = account._id;

    workflow.user.save(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit(nextStep);
    });
  });
};

/*******************************************************************************
 * sendWelcomeEmail()
 *******************************************************************************
 * Send a welcome email.
 *
 * Inputs:
 *   params: { userData: { username, email } }
 *
 *   workflow:
 *
 *   nextStep:
 */
SignupUtil.sendWelcomeEmail = function(params, workflow, nextStep)
{
  var userData = params.userData;

  App.utility.email(params.request, params.response,
  {
    from: App.get('email-from-name') +' <'+ App.get('email-from-address') +'>',
    to: userData.email,
    subject: 'Your '+ App.get('project-name') +' Account',
    textPath: 'signup/email-text',
    htmlPath: 'signup/email-html',

    locals:
    {
      username: userData.username,
      email: userData.email,
      loginURL: 'http://'+ params.request.headers.host +'/login/',
      projectName: App.get('project-name')
    },

    success: function(message)
    {
      workflow.emit(nextStep);
    },

    error: function(error)
    {
      console.log('Error Sending Welcome Email: '+ error);
      workflow.emit(nextStep);
    }
  });
};

/*******************************************************************************
 * logUserIn()
 *******************************************************************************
 * Automatically log the new user in.
 */
SignupUtil.logUserIn = function(user, workflow, request)
{
  request.login(user, function(error)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
    workflow.emit('response');
  });
}
