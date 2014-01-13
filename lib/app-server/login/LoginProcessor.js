//
//  LoginProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var LoginProcessor = module.exports;

var App = require('app').app,
    jwt = require('jwt-simple'),
    wf = require('app-server/common/Workflow');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response
 */
LoginProcessor.init = function(request, response)
{
  // Are we logged in?
  if (request.isAuthenticated())
    response.redirect(App.defaultReturnUrl(request.user));
  else
    renderLoginScreen(request, response);
};

/*******************************************************************************
 * loginUsernamePassword
 *******************************************************************************
 * Login using username and password.
 *
 * Inputs:
 *   request, response
 */
LoginProcessor.loginUsernamePassword = function(request, response)
{
  function validate()
  {
    if (!request.body.username)
      workflow.outcome.errfor.username = 'required';

    if (!request.body.password)
      workflow.outcome.errfor.password = 'required';

    // Return if we have errors already.
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('attemptLogin');
  }

  function authenticationCallback(error, user, info)
  {
    if (error)
      return workflow.emit('exception', error);

    if (!user)
    {
      workflow.outcome.errors.push('Username and password combination not found or your account is inactive.');
      return workflow.emit('response');
    }
    else
    {
      request.login(user, function(error)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.defaultReturnUrl = App.defaultReturnUrl(user);
        workflow.outcome.username = user.username;
        workflow.emit('response');
      });
    }
  }

  function attemptLogin()
  {
    var authenticationFn = request._passport.instance.authenticate('local', authenticationCallback);
    authenticationFn(request, response);
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('attemptLogin', attemptLogin);
  workflow.emit('validate');
};

/*******************************************************************************
 * loginTwitter
 *******************************************************************************
 * Login using Twitter auth.
 *
 * Inputs:
 *   request, response, next:
 */
LoginProcessor.loginTwitter = function(request, response, next)
{
  loginSocial(
  {
    socialType: "twitter",
    errorMessage: 'No users found linked to your Twitter account. You may need to create an account first.'
  }, request, response, next);
};

/*******************************************************************************
 * loginFacebook
 *******************************************************************************
 * Login using Facebook auth.
 *
 * Inputs:
 *   request, response, next:
 */
LoginProcessor.loginFacebook = function(request, response, next)
{
  loginSocial(
  {
    socialType: "facebook",
    extraAuthenticateParams: { callbackURL: '/login/facebook/callback/' },
    errorMessage: 'No users found linked to your Facebook account. You may need to create an account first.'
  }, request, response, next);
};

/*******************************************************************************
 * loginGoogle
 *******************************************************************************
 * Login using Google auth.
 *
 * Inputs:
 *   request, response, next:
 */
LoginProcessor.loginGoogle = function(request, response, next)
{
  loginSocial(
  {
    socialType: "google",
    extraAuthenticateParams: { callbackURL: '/login/google/callback/' },
    errorMessage: 'No users found linked to your Google account. You may need to create an account first.'
  }, request, response, next);
};

/*******************************************************************************
 * loginGitHub
 *******************************************************************************
 * Login using Github auth.
 *
 * Inputs:
 *   request, response, next:
 */
LoginProcessor.loginGitHub = function(request, response, next)
{
  loginSocial(
  {
    socialType: "github",
    errorMessage: 'No users found linked to your GitHub account. You may need to create an account first.'
  }, request, response, next);
};

/*******************************************************************************
 * loginSocial
 *******************************************************************************
 * Login using a social account.
 *
 * Inputs:
 *   params:
 *
 *   request, response, next:
 */
function loginSocial(params, request, response, next)
{
  var socialType = params.socialType;
  var extraAuthenticateParams = params.extraAuthenticateParams;
  var errorMessage = params.errorMessage;

  function authenticationCallback(error, user, info)
  {
    if (error)
      return next(error);

    // TODO: fix for ajax
    if (!info || !info.profile)
      return response.redirect('/login/');

    var queryParams = {};

    queryParams[socialType + 'Id'] = info.profile.id + '';

    App.db.findOne('users', queryParams, function(error, user)
    {
      if (error)
      {
        if (request.isAjaxRequest)
          return response.send({ success: false });
        else
          return next(error);
      }

      if (!user)
      {
        if (request.isAjaxRequest)
          return response.send({ success: false });
        else
          return renderLoginScreen(request, response, errorMessage);
      }
      else
      {
        if (request.isAjaxRequest)
          response.send({ success: true, authToken: jwt.encode({ _id: user._id }, App.get('JWT_TOKEN_SECRET')) });
        else
        {
          request.login(user, function(error)
          {
            if (error)
              return next(error);

            response.redirect(App.defaultReturnUrl(user));
          });
        }
      }
    });
  }

  if (request.isAjaxRequest)
  {
    authenticationCallback(null, null, { profile: request.body })
  }
  else
  {
    var authenticationFn = extraAuthenticateParams ?
      request._passport.instance.authenticate(socialType, extraAuthenticateParams, authenticationCallback) :
      request._passport.instance.authenticate(socialType, authenticationCallback);

    authenticationFn(request, response, next);
  }
}

/*******************************************************************************
 * renderLoginScreen
 *******************************************************************************
 * Render the login screen.
 *
 * Inputs:
 *   request, response, oauthMessage:
 */
function renderLoginScreen(request, response, oauthMessage)
{
  response.render('login/index',
  {
    returnUrl: request.query.returnUrl || '/',
    oauthMessage: oauthMessage || '',
    oauthTwitter: !!request.app.get('twitter-oauth-key'),
    oauthGitHub: !!request.app.get('github-oauth-key'),
    oauthGoogle: !!request.app.get('google-oauth-key'),
    oauthFacebook: !!request.app.get('facebook-oauth-key')
  });
}

LoginProcessor.loginSingly = function(request, response, next)
{
  request._passport.instance.authenticate('singly', function(error, user, info)
  {
    if (!info || !info.profile)
      return response.redirect('/login/');

    var profile = info.profile._json;
    var twitterProfile = profile.services && profile.services.twitter;

    if (!twitterProfile)
      return response.redirect('/login/');

    // request.app.db.models.User.findOne({ 'twitter.id_str': twitterProfile.id }, function(error, user)
    App.db.findOne('users', { 'twitter.id_str': twitterProfile.id }, function(error, user)
    {
      if (error)
        return next(error);

      if (!user)
      {
        response.render('login/index', {
          returnUrl: request.query.returnUrl || '/',
          oauthMessage: 'No users found linked to your Twitter account. You may need to create an account first.',
          oauthTwitter: !! request.app.get('twitter-oauth-key'),
          oauthGitHub: !! request.app.get('github-oauth-key'),
          oauthFacebook: !! request.app.get('facebook-oauth-key')
        });
      }
      else
      {
        request.login(user, function(error)
        {
          if (error)
            return next(error);

          response.redirect(App.defaultReturnUrl(user));
        });
      }
    });
  })(request, response, next);
};
