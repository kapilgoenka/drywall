//
//  SignupProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var SignupProcessor = module.exports;

var epsup = require('lib/app-server/signup/EmailPasswordSignupProcessor'),
    ssup = require('lib/app-server/signup/SocialSignupProcessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Initialize user account creation.
 *
 * Inputs:
 *   request, response
 */
SignupProcessor.init = function(request, response)
{
  // Are we logged in?
  if (request.isAuthenticated())
    response.redirect(request.user.defaultReturnUrl());
  else
    renderSignupScreen(request, response);
};

/*******************************************************************************
 * signup()
 *******************************************************************************
 * Create a new user account with username/password.
 *
 * Inputs:
 *   request, response
 */
SignupProcessor.signupUsernamePassword = function(request, response)
{
  var signupProcessor = new epsup.EmailPasswordSignupProcessor(request, response);
  signupProcessor.execute();
};

/*******************************************************************************
 * processSocialSignupRequest()
 *******************************************************************************
 * Process a new user request based on a social login.
 *
 * Inputs:
 *   request, response
 */
SignupProcessor.processSocialSignupRequest = function(request, response)
{
  var signupProcessor = new ssup.SocialSignupProcessor(request, response);
  signupProcessor.execute();
};

/*******************************************************************************
 * signupTwitter()
 *******************************************************************************
 * Create a new user account via Twitter auth.
 *
 * Inputs:
 *   request, response, next:
 */
SignupProcessor.signupTwitter = function(request, response, next)
{
  signupSocial(
  {
    socialType: "twitter",
    errorMessage: 'We found a user linked to your Twitter account.'
  }, request, response, next);
};

/*******************************************************************************
 * signupFacebook()
 *******************************************************************************
 * Create a new user account via Facebook auth.
 *
 * Inputs:
 *   request, response, next:
 */
SignupProcessor.signupFacebook = function(request, response, next)
{
  signupSocial(
  {
    socialType: "facebook",
    extraAuthenticateParams: { callbackURL: '/signup/facebook/callback/' },
    errorMessage: 'We found a user linked to your Facebook account.'
  }, request, response, next);
};

/*******************************************************************************
 * signupGitHub()
 *******************************************************************************
 * Create a new user account via github auth.
 *
 * Inputs:
 *   request, response, next:
 */
SignupProcessor.signupGitHub = function(request, response, next)
{
  signupSocial(
  {
    socialType: "github",
    errorMessage: 'We found a user linked to your GitHub account.'
  }, request, response, next);
};

/*******************************************************************************
 * signupSocial()
 *******************************************************************************
 * Create a new user account via social auth.
 *
 * Inputs:
 *   params:
 *
 *   request, response, next:
 */
function signupSocial(params, request, response, next)
{
  var socialType = params.socialType;
  var extraAuthenticateParams = params.extraAuthenticateParams;
  var errorMessage = params.errorMessage;

  function authenticationCallback(error, user, info)
  {
    if (error)
      return next(error);

    if (!info || !info.profile)
      return response.redirect('/signup/');

    function dbCallback(error, user)
    {
      if (error)
        return next(error);

      if (!user)
      {
        request.session.socialProfile = info.profile;
        response.render('signup/social', { email: getEmailForSocialLogin(socialType, info.profile) });
      }
      else
        renderSignupScreen(request, response, errorMessage);
    }

    var queryParams = {};
    queryParams[socialType + '.id'] = info.profile.id;

    request.app.db.models.User.findOne(queryParams, dbCallback);
  }

  var authenticationFn = extraAuthenticateParams ?
    request._passport.instance.authenticate(socialType, extraAuthenticateParams, authenticationCallback) :
    request._passport.instance.authenticate(socialType, authenticationCallback);

  authenticationFn(request, response, next);
}

/*******************************************************************************
 * getEmailForSocialLogin()
 *******************************************************************************
 * Return an email address from a logged in social profile..
 *
 * Inputs:
 *   socialType:
 *
 *   profile:
 */
function getEmailForSocialLogin(socialType, profile)
{
  if (socialType === 'twitter')
    return '';

  return profile.emails[0].value || '';
}

/*******************************************************************************
 * renderSignupScreen
 *******************************************************************************
 * Render the signup screen.
 *
 * Inputs:
 *   request, response, oauthMessage:
 */
function renderSignupScreen(request, response, oauthMessage)
{
  response.render('signup/index',
  {
    oauthMessage: oauthMessage || '',
    oauthTwitter: !!request.app.get('twitter-oauth-key'),
    oauthGitHub: !!request.app.get('github-oauth-key'),
    oauthFacebook: !!request.app.get('facebook-oauth-key')
  });
}
