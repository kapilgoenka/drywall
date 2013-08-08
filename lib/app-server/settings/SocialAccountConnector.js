//
//  SocialAccountConnector.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var SocialAccountConnector = module.exports;

var App = require('app').app,
    async = require('async'),
    _ = require('underscore');

var SCHEMA_MAP =
{
  twitter: "TwitterAccount",
  facebook: "FacebookAccount"
};

/*******************************************************************************
 * connectTwitter
 *******************************************************************************
 * Connect a Twitter account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.connectTwitter = function(request, response, next)
{
  connectSocial(
  {
    socialType: "twitter",
    errorMessage: 'Another user has already connected with that Twitter account.'
  }, request, response, next);
};

/*******************************************************************************
 * connectFacebook
 *******************************************************************************
 * Connect a Facebook account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.connectFacebook = function(request, response, next)
{
  connectSocial(
  {
    socialType: "facebook",
    extraAuthenticateParams: { callbackURL: '/account/settings/facebook/callback/' },
    errorMessage: 'Another user has already connected with that Facebook account.'
  }, request, response, next);
};

/*******************************************************************************
 * connectGitHub
 *******************************************************************************
 * Connect a Github account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.connectGitHub = function(request, response, next)
{
  connectSocial(
  {
    socialType: "github",
    errorMessage: 'Another user has already connected with that Github account.'
  }, request, response, next);
};

/*******************************************************************************
 * disconnectTwitter
 *******************************************************************************
 * Disconnect a Twitter account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.disconnectTwitter = function(request, response, next)
{
  disconnectSocial({ socialType: "twitter" }, request, response, next);
};

/*******************************************************************************
 * disconnectFacebook
 *******************************************************************************
 * Disconnect a Facebook account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.disconnectFacebook = function(request, response, next)
{
  disconnectSocial({ socialType: "facebook" }, request, response, next);
};

/*******************************************************************************
 * disconnectGitHub
 *******************************************************************************
 * Disconnect a Github account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.disconnectGitHub = function(request, response, next)
{
  disconnectSocial({ socialType: "github" }, request, response, next);
};

/*******************************************************************************
 * displaySettings
 *******************************************************************************
 * Render the current settings.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.displaySettings = function(request, response, next)
{
  renderSettings(request, response, next);
};

/*******************************************************************************
 * addSocialAccount
 *******************************************************************************
 * Add a social account record for an existing user account.
 *
 * Inputs:
 *   userId, socialProfile:
 *
 *   callback:
 */
SocialAccountConnector.addSocialAccount = function(userId, socialProfile, callback)
{
  var socialType = socialProfile.provider;
  var schema = SCHEMA_MAP[socialType];

  // First create a new social account record.
  App.db.models[schema].create(socialProfile._json, function(error, account)
  {
    if (error)
      return callback(error);

    // Now update the user record.
    var updateParams = {};
    updateParams[socialType + '.id'] = socialProfile.id;

    return App.db.models.User.findByIdAndUpdate(userId, updateParams, callback);
  } );
};

/*******************************************************************************
 * connectSocial
 *******************************************************************************
 * Connect a social account to an existing user account.
 *
 * Inputs:
 *   params:
 *
 *   request, response, next:
 */
function connectSocial(params, request, response, next)
{
  var socialType = params.socialType;
  var extraAuthenticateParams = params.extraAuthenticateParams;
  var errorMessage = params.errorMessage;

  function authenticationCallback(error, user, info)
  {
    if (error)
      return next(error);

    if (!info || !info.profile)
      return response.redirect('/account/settings/');

    var queryParams =
    {
      _id: { $ne: request.user.id }
    };

    queryParams[socialType + '.id'] = info.profile.id;

    request.app.db.models.User.findOne(queryParams, function(error, user)
    {
      if (error)
        return next(error);

      if (user)
        return renderSettings(request, response, next, errorMessage);

      // Add a social account record.
      SocialAccountConnector.addSocialAccount(request.user.id, info.profile, function(error, user)
      {
        if (error)
          return next(error);

        return response.redirect('/account/settings/');
      });
    });
  }

  var authenticationFn = extraAuthenticateParams ?
    request._passport.instance.authenticate(socialType, extraAuthenticateParams, authenticationCallback) :
    request._passport.instance.authenticate(socialType, authenticationCallback);

  authenticationFn(request, response, next);
}

/*******************************************************************************
 * removeSocialAccount
 *******************************************************************************
 * Remove a social account record from an existing user account.
 *
 * Inputs:
 *   user, socialType:
 *
 *   callback:
 */
SocialAccountConnector.removeSocialAccount = function(user, socialType, callback)
{
  var socialId = user[socialType + '.id'];
  var schema = SCHEMA_MAP[socialType];

  // First delete the social account record.
  App.db.models[schema].remove(socialId, function(error, numModified)
  {
    if (error)
      return callback(error);

    // Now update the user record.
    var socialIdParam = {};
    socialIdParam[socialType] = { id: 0 };

    App.db.models.User.findByIdAndUpdate(user.id, { $unset: socialIdParam }, callback);
  } );
};

/*******************************************************************************
 * disconnectSocial
 *******************************************************************************
 * Disconnect a social account from a user account.
 *
 * Inputs:
 *   params:
 *
 *   request, response, next:
 */
function disconnectSocial(params, request, response, next)
{
  request.app.db.models.User.findById(request.user.id, function(error, user)
  {
    if (error)
      return next(error);

    if (!user)
      return next("User not found!");

    SocialAccountConnector.removeSocialAccount(user, params.socialType, function(error, user)
    {
      if (error)
        return next(error);

      response.redirect('/account/settings/');
    } );
  } );
}

/*******************************************************************************
 * renderSettings
 *******************************************************************************
 * Render the current settings.
 *
 * Inputs:
 *   request, response, next, oauthMessage:
 */
function renderSettings(request, response, next, oauthMessage)
{
  oauthMessage = oauthMessage || '';
  var outcome = {};

  function getAccountData(callback)
  {
    request.app.db.models.Account.findById(request.user.roles.account.id, 'name company phone zip').exec(function(error, account)
    {
      if (error)
        return callback(error, null);

      outcome.account = account;
      return callback(null, 'done');
    });
  }

  function getUserData(callback)
  {
    request.app.db.models.User.findById(request.user.id, 'username email twitter.id github.id facebook.id').exec(function(error, user)
    {
      if (error)
        return callback(error, null);

      outcome.user = user;
      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

    response.render('account/settings/index',
    {
      data:
      {
        account: JSON.stringify(outcome.account),
        user: JSON.stringify(outcome.user)
      },
      oauthMessage: oauthMessage,
      oauthTwitter: !!request.app.get('twitter-oauth-key'),
      oauthTwitterActive: outcome.user.twitter ? !!outcome.user.twitter.id : false,
      oauthGitHub: !!request.app.get('github-oauth-key'),
      oauthGitHubActive: outcome.user.github ? !!outcome.user.github.id : false,
      oauthFacebook: !!request.app.get('facebook-oauth-key'),
      oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false
    });
  }

  async.parallel([getAccountData, getUserData], asyncFinally);
}
