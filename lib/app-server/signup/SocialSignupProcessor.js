//
//  SocialSignupProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 Evri. All rights reserved.
//
var ssup = module.exports;

var App = require('app').app,
    SignupUtil = require('app-server/signup/SignupUtil');
//    winston = require('winston'),
//    log = winston.loggers.get('ss-default');

ssup.SocialSignupProcessor = (function()
{
  /*******************************************************************************
   * SocialSignupProcessor()
   *******************************************************************************
   * Create a new instance of SocialSignupProcessor.
   *
   * Inputs:
   *   request, response:
   */
  function SocialSignupProcessor(request, response)
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
  SocialSignupProcessor.prototype.init = function()
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
  SocialSignupProcessor.prototype.execute = function()
  {
    // Kick off the this.workflow processing.
    this.workflow.emit('validate');
  };

  /*******************************************************************************
   * validate()
   *******************************************************************************
   * Validate the signup parameters.
   */
  SocialSignupProcessor.prototype.validate = function()
  {
    if (!this.signupParams.email)
      this.workflow.outcome.errfor.email = 'required';

    else if (!SignupUtil.isValidEmailFormat(this.signupParams.email))
      this.workflow.outcome.errfor.email = 'invalid email format';

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
  SocialSignupProcessor.prototype.duplicateUsernameCheck = function()
  {
    var self = this;

    this.workflow.username = this.request.session.socialProfile.username;
    if (!SignupUtil.isValidUsernameFormat(this.workflow.username))
      this.workflow.username = this.workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');

    App.db.models.User.findOne({ username: this.workflow.username }, function(error, user)
    {
      if (error)
        return self.workflow.emit('exception', error);

      if (user)
        self.workflow.username = self.workflow.username + self.request.session.socialProfile.id;
      else
        self.workflow.username = self.workflow.username;

      self.workflow.emit('duplicateEmailCheck');
    });
  };

  /*******************************************************************************
   * duplicateEmailCheck()
   *******************************************************************************
   * Check for email already in use.
   */
  SocialSignupProcessor.prototype.duplicateEmailCheck = function()
  {
    SignupUtil.duplicateEmailCheck(this.signupParams, this.workflow, 'createUser');
  };

  /*******************************************************************************
   * createUser()
   *******************************************************************************
   * Create the user record.
   */
  SocialSignupProcessor.prototype.createUser = function()
  {
    var baseParams =
    {
      username: this.workflow.username,
      password: this.signupParams.password,
      email: this.signupParams.email
    };

    var additionalFields = {};
    additionalFields[this.request.session.socialProfile.provider] = this.request.session.socialProfile._json;

    SignupUtil.createUser({ baseParams: baseParams, additionalFields: additionalFields }, this.workflow, 'createAccount');
  };

  /*******************************************************************************
   * createAccount()
   *******************************************************************************
   * Create an account record linked to the user record.
   */
  SocialSignupProcessor.prototype.createAccount = function()
  {
    var nameParts = this.request.session.socialProfile.displayName.split(' ');

    var firstName = nameParts[0];
    var lastName = nameParts[1] || '';

    var accountData =
    {
      'name.first': firstName,
      'name.last': lastName,
      'name.full': this.request.session.socialProfile.displayName,

      user:
      {
        id: this.workflow.user._id,
        name: this.workflow.user.username
      },

      search: [firstName, lastName]
    };

    SignupUtil.createAccount(accountData, this.workflow, 'sendWelcomeEmail');
  };

  /*******************************************************************************
   * sendWelcomeEmail()
   *******************************************************************************
   * Send a welcome email.
   */
  SocialSignupProcessor.prototype.sendWelcomeEmail = function()
  {
    var userData =
    {
      username: this.workflow.user.username,
      email: this.signupParams.email
    };

    SignupUtil.sendWelcomeEmail({ userData: userData, request: this.request, response: this.response }, this.workflow, 'logUserIn');
  };

  /*******************************************************************************
   * logUserIn()
   *******************************************************************************
   * Automatically log the new user in.
   */
  SocialSignupProcessor.prototype.logUserIn = function()
  {
    SignupUtil.logUserIn(this.workflow.user, this.workflow, this.request);
  }

  return SocialSignupProcessor;
})();
