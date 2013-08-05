//
//  EmailPasswordSignupProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 Evri. All rights reserved.
//
var epsup = module.exports;

var App = require('app').app,
    SignupUtil = require('app-server/signup/SignupUtil');
//    passport = require('passport');
//    winston = require('winston'),
//    log = winston.loggers.get('ss-default');

epsup.EmailPasswordSignupProcessor = (function()
{
  /*******************************************************************************
   * EmailPasswordSignupProcessor()
   *******************************************************************************
   * Create a new instance of EmailPasswordSignupProcessor.
   *
   * Inputs:
   *   request, response:
   */
  function EmailPasswordSignupProcessor(request, response)
  {
    this.request = request;
    this.response = response;
    this.signupParams = this.request.body;
    this.workflow = new App.utility.Workflow(request, response);
    this.init();
  }

  /*******************************************************************************
   * init()
   *******************************************************************************
   * Initialize workflow callbacks.
   */
  EmailPasswordSignupProcessor.prototype.init = function()
  {
    this.workflow.on('validate', this.validate.bind(this));

    // Check for user name already in use.
    this.workflow.on('duplicateUsernameCheck', this.duplicateUsernameCheck.bind(this));

    // Check for email already in use.
    this.workflow.on('duplicateEmailCheck', this.duplicateEmailCheck.bind(this));

    // Create the user record.
    this.workflow.on('createUser', this.createUser.bind(this));

    // Create an account record linked to the user record.
    this.workflow.on('createAccount', this.createAccount.bind(this));

    // Send a welcome email.
    this.workflow.on('sendWelcomeEmail', this.sendWelcomeEmail.bind(this));

    // Automatically log the new user in.
    this.workflow.on('logUserIn', this.logUserIn.bind(this));
  };

  /*******************************************************************************
   * execute()
   *******************************************************************************
   * Create a new user account with username/password.
   */
  EmailPasswordSignupProcessor.prototype.execute = function()
  {
    // Kick off the this.workflow processing.
    this.workflow.emit('validate');
  };

  /*******************************************************************************
   * validate()
   *******************************************************************************
   * Validate the signup parameters.
   */
  EmailPasswordSignupProcessor.prototype.validate = function()
  {
    if (!this.signupParams.email)
      this.workflow.outcome.errfor.email = 'required';

    else if (!SignupUtil.isValidEmailFormat(this.signupParams.email))
      this.workflow.outcome.errfor.email = 'invalid email format';

    else if (!this.signupParams.username)
      this.workflow.outcome.errfor.username = 'required';

    else if (!SignupUtil.isValidUsernameFormat(this.signupParams.username))
      this.workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';

    if (!this.signupParams.password)
      this.workflow.outcome.errfor.password = 'required';

    // Return if we have errors already.
    if (this.workflow.hasErrors())
      return this.workflow.emit('response');

    this.workflow.emit('duplicateUsernameCheck');
  };

  /*******************************************************************************
   * duplicateUsernameCheck()
   *******************************************************************************
   * Check for user name already in use.
   */
  EmailPasswordSignupProcessor.prototype.duplicateUsernameCheck = function()
  {
    var self = this;

    App.db.models.User.findOne({ username: this.signupParams.username }, function(error, user)
    {
      if (error)
        return self.workflow.emit('exception', error);

      if (user)
      {
        self.workflow.outcome.errfor.username = 'username already taken';
        return self.workflow.emit('response');
      }

      self.workflow.emit('duplicateEmailCheck');
    });
  };

  /*******************************************************************************
   * duplicateEmailCheck()
   *******************************************************************************
   * Check for email already in use.
   */
  EmailPasswordSignupProcessor.prototype.duplicateEmailCheck = function()
  {
    SignupUtil.duplicateEmailCheck(this.signupParams, this.workflow, 'createUser');
  };

  /*******************************************************************************
   * createUser()
   *******************************************************************************
   * Create the user record.
   */
  EmailPasswordSignupProcessor.prototype.createUser = function()
  {
    SignupUtil.createUser({ baseParams: this.signupParams }, this.workflow, 'createAccount');
  };

  /*******************************************************************************
   * createAccount()
   *******************************************************************************
   * Create an account record linked to the user record.
   */
  EmailPasswordSignupProcessor.prototype.createAccount = function()
  {
    var accountData =
    {
      'name.full': this.workflow.user.username,
      user:
      {
        id: this.workflow.user._id,
        name: this.workflow.user.username
      },
      search: [this.workflow.user.username]
    };

    SignupUtil.createAccount(accountData, this.workflow, 'sendWelcomeEmail');
  };

  /*******************************************************************************
   * sendWelcomeEmail()
   *******************************************************************************
   * Send a welcome email.
   */
  EmailPasswordSignupProcessor.prototype.sendWelcomeEmail = function()
  {
    SignupUtil.sendWelcomeEmail({ userData: this.signupParams, request: this.request, response: this.response }, this.workflow, 'logUserIn');
  };

  /*******************************************************************************
   * logUserIn()
   *******************************************************************************
   * Automatically log the new user in.
   */
  EmailPasswordSignupProcessor.prototype.logUserIn = function()
  {
    var self = this;

    function authenticationCallback(error, user, info)
    {
      if (error)
        return self.workflow.emit('exception', error);

      if (!user)
      {
        self.workflow.outcome.errors.push('Login failed. That is strange.');
        return self.workflow.emit('response');
      }
      else
        SignupUtil.logUserIn(user, self.workflow, self.request);
    }

    // Automatically log the new user in.
    var authenticationFn = this.request._passport.instance.authenticate('local', authenticationCallback);
    authenticationFn(this.request, this.response);
  }

  return EmailPasswordSignupProcessor;
})();
