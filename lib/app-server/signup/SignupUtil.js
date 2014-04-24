//
//  SignupUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var SignupUtil = module.exports,
    App = require('app').app,
    uuid = require('node-uuid'),
    _ = require('underscore'),
    jwt = require('jwt-simple'),
    EmailSender = require('app-server/common/EmailSender'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');
//    winston = require('winston'),
//    log = winston.loggers.get('ss-account-default');

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
SignupUtil.duplicateEmailCheck = function(newEmail, workflow, nextStep)
{
  RiakDBAccessor.findOne('users', { email: newEmail }, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (user)
    {
      workflow.outcome.errfor.email = { msg: 'Email already registered ' + newEmail, logLevel: 'debug' };
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
};

SignupUtil.duplicateUsernameCheck = function(newUsername, workflow, nextStep)
{
  var self = this;

  RiakDBAccessor.findOne('users', { username: newUsername }, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (user)
    {
      workflow.outcome.errfor.username = 'username already taken';
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
};

/*******************************************************************************
 * ensureUniqueUsername()
 *******************************************************************************
 * Create a unique user name by using a socialId as a suffix.
 *
 * Inputs:
 *   username:
 *
 *   socialId:
 *
 *   callback:
 */
SignupUtil.ensureUniqueUsername = function(username, socialId, callback)
{
  var self = this;

  RiakDBAccessor.findOne('users', { username: username }, function(error, user)
  {
    if (error)
      return callback(error);

    if (!user)
      return callback(null, username);

    // If a user with that name already exists, use the socialId to create a unique name.
    return self.ensureUniqueUsername(username + socialId, socialId, callback);
  });
};

/*******************************************************************************
 * createUser()
 *******************************************************************************
 * Create the user record.
 *
 * Inputs:
 *   createUserParams: { baseParams: { username, password, email }, additionalParams }
 *   callback:
 */
SignupUtil.createUser = function(createUserParams, callback)
{
  var baseParams = createUserParams.baseParams;
  var additionalParams = createUserParams.additionalParams;

  // base params
  var userData = { username: baseParams.username };
  if (baseParams.email)
    userData.email = baseParams.email;
  if (baseParams.password)
    userData.password = App.encryptPassword(baseParams.password);

  // additional params
  if (additionalParams)
    _.extend(userData, additionalParams);

  // default propeties
  userData._id = uuid.v4();
  userData.isActive = 'yes';
  userData.accounts = {};

  userData.search = [baseParams.username];
  if (baseParams.email)
    userData.search.push(baseParams.email);

  RiakDBAccessor.update('users', userData._id, userData, function(error, user)
  {
    if (error)
      return callback(error);

    console.log('created user with id ' + user._id);

    callback(null, user);
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
  workflow.emit(nextStep);

  // var userData = params.userData;
  //
  // EmailSender.email(params.request, params.response,
  // {
  //   from: App.get('email-from-name') +' <'+ App.get('email-from-address') +'>',
  //   to: userData.email,
  //   subject: 'Your '+ App.get('project-name') +' Account',
  //   textPath: 'signup/email-text',
  //   htmlPath: 'signup/email-html',
  //
  //   locals:
  //   {
  //     username: userData.username,
  //     email: userData.email,
  //     loginURL: 'http://'+ params.request.headers.host +'/login/',
  //     projectName: App.get('project-name')
  //   },
  //
  //   success: function(message)
  //   {
  //     workflow.emit(nextStep);
  //   },
  //
  //   error: function(error)
  //   {
  //     console.log('Error Sending Welcome Email: '+ error);
  //     workflow.emit(nextStep);
  //   }
  // });
};

/*******************************************************************************
 * logUserIn()
 *******************************************************************************
 * Automatically log the new user in.
 */
SignupUtil.logUserIn = function(user, workflow, request)
{
  if (request.xhr)
  {
    workflow.outcome.authToken = jwt.encode({ _id: user._id }, request.app.get('JWT_TOKEN_SECRET'));
    workflow.emit('response');
  }
  else
  {
    request.login(user, function(error)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.defaultReturnUrl = request.app.defaultReturnUrl(user);
      workflow.emit('response');
    });
  }
};
