//
//  SocialSignupProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 Evri. All rights reserved.
//
var ssup = module.exports;

var App = require('app').app,
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    SocialAccountConnector = require('app-server/settings/SocialAccountConnector');

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
    this.workflow = new wf.Workflow(request, response);
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

    // Create a social account record linked to the user record.
    this.workflow.on('createSocialAccount', this.createSocialAccount.bind(this));

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

    // Note: For Twitter:
    //   socialProfile.username == Twitter screen_name.
    //   socialProfile.displayName == Twitter name.

    this.workflow.username = this.request.session.socialProfile.username;
    if (!SignupUtil.isValidUsernameFormat(this.workflow.username))
      this.workflow.username = this.workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');

    SignupUtil.ensureUniqueUsername(this.workflow.username, this.request.session.socialProfile.id, function(error, uniqueUsername)
    {
      if (error)
        return self.workflow.emit('exception', error);

      self.workflow.username = uniqueUsername;
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
//      password: this.signupParams.password,
      email: this.signupParams.email
    };

    // See if a password was provided.
    var password = this.signupParams.password;
    if (password && password.length > 0)
      baseParams.password = password;

    var additionalFields = {};
//    additionalFields[this.request.session.socialProfile.provider] = this.request.session.socialProfile._json;

    SignupUtil.createUser({ baseParams: baseParams, additionalFields: additionalFields }, this.workflow, 'createSocialAccount');
  };

  /*******************************************************************************
   * createSocialAccount()
   *******************************************************************************
   * Create a social account record linked to the user record.
   */
  SocialSignupProcessor.prototype.createSocialAccount = function()
  {
    var self = this;
    var user = this.workflow.user;
    var socialProfile = this.request.session.socialProfile;

    SocialAccountConnector.addSocialAccount(user, socialProfile, function(error, user)
    {
      if (error)
        return self.workflow.emit('exception', error);

      self.workflow.emit('createAccount');
    } );
  };

  /*******************************************************************************
   * createAccount()
   *******************************************************************************
   * Create an account record linked to the user record.
   */
  SocialSignupProcessor.prototype.createAccount = function()
  {
//    var accountName = this.request.session.socialProfile.displayName;
    var accountName = this.request.session.socialProfile.displayName;

    var nameParts = accountName.split(' ');

    var firstName = nameParts[0];
    var lastName = nameParts[1] || '';

    var accountData =
    {
      'name.first': firstName,
      'name.last': lastName,
      'name.full': accountName,

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
