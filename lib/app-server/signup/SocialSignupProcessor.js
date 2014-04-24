//
//  SocialSignupProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 Evri. All rights reserved.
//
var ssup = module.exports;

var wf = require('app-server/common/Workflow'),
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
    this.signupParams = this.request.body || {};
    this.request.session = this.request.session || {};
    if (!this.request.session.socialProfile)
      this.request.session.socialProfile = this.signupParams;
    this.workflow = new wf.Workflow({ request: request, response: response, name: 'Social Signup: ' + this.signupParams.username });
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

    // Note:
    //   For Twitter:
    //     socialProfile.username == Twitter screen_name.
    //     socialProfile.displayName == Twitter name.
    //
    //   For Google:
    //     socialProfile.username == undefined.
    //     socialProfile.displayName == Google name.

    var socialProfile = this.request.session.socialProfile;
    this.workflow.username = socialProfile.username || socialProfile.email || socialProfile.displayName;

    if (!SignupUtil.isValidUsernameFormat(this.workflow.username))
      this.workflow.username = this.workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');

    SignupUtil.ensureUniqueUsername(this.workflow.username, socialProfile.id, function(error, uniqueUsername)
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
    SignupUtil.duplicateEmailCheck(this.signupParams.email, this.workflow, 'createUser');
  };

  /*******************************************************************************
   * createUser()
   *******************************************************************************
   * Create the user record.
   */
  SocialSignupProcessor.prototype.createUser = function()
  {
    var self = this;

    var baseParams =
    {
      username: this.workflow.username,
      email: this.signupParams.email
    };

    // See if a password was provided.
    var password = this.signupParams.password;
    if (password && password.length)
      baseParams.password = password;

    // additional params
    var additionalParams = {};
    additionalParams.firstName = this.signupParams.firstName;
    additionalParams.lastName = this.signupParams.lastName;
    additionalParams.displayName = this.signupParams.displayName || baseParams.username;

    SignupUtil.createUser({ baseParams: baseParams, additionalParams: additionalParams }, function(error, user)
    {
      if (error)
        return self.workflow.emit('exception', error);

      self.workflow.user = user;
      self.workflow.emit('createSocialAccount');
    });
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

    SocialAccountConnector.addSocialAccount(user._id, socialProfile, function(error, user)
    {
      if (error)
        return self.workflow.emit('exception', error);

      self.workflow.user = user;
      self.workflow.emit('sendWelcomeEmail');
    });
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
