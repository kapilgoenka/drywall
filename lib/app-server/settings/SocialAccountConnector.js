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
    _ = require('underscore'),
    winston = require('winston'),
    log = winston.loggers.get('ss-account-default');

SocialAccountConnector.SCHEMA_MAP =
{
  twitter: "TwitterAccount",
  facebook: "FacebookAccount",
  google: "GoogleAccount"
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
 * connectGoogle
 *******************************************************************************
 * Connect a Google account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.connectGoogle = function(request, response, next)
{
  connectSocial(
  {
    socialType: "google",
    extraAuthenticateParams: { callbackURL: '/account/settings/google/callback/' },
    errorMessage: 'Another user has already connected with that Google account.'
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
 * disconnectGoogle
 *******************************************************************************
 * Disconnect a Google account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
SocialAccountConnector.disconnectGoogle = function(request, response, next)
{
  disconnectSocial({ socialType: "google" }, request, response, next);
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
 *   user, socialProfile:
 *
 *   callback:
 */
SocialAccountConnector.addSocialAccount = function(user, socialProfile, callback)
{
  var socialType = socialProfile.provider;
  var schema = this.SCHEMA_MAP[socialType];

  var socialAccountData =
  {
    userId: user.id,
    profile: socialProfile._json,
    search: getSearchKeysForSocialAccount(socialType, socialProfile._json)
  };

  // First create a new social account record.
  App.db.models[schema].create(socialAccountData, function(error, account)
  {
    if (error)
      return callback(error);

    // Now update the user record.
    var updateParams = {};
    updateParams[socialType + '.id'] = socialProfile.id;

    return App.db.models.User.findByIdAndUpdate(user.id, updateParams, callback);
  } );
};

/*******************************************************************************
 * getSearchKeysForSocialAccount()
 *******************************************************************************
 * Return an array of search keys for a social account.
 *
 * Inputs:
 *   socialType:
 *
 *   profile:
 */
function getSearchKeysForSocialAccount(socialType, profile)
{
  if (socialType === 'twitter')
    return [profile.id_str, profile.name, profile.screen_name];

  if (socialType === 'facebook')
    return [profile.id, profile.name];

  if (socialType === 'google')
    return [profile.id, profile.name];

  return [];
}

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

    var socialProfile = info && info.profile;

    if (!socialProfile)
      return response.redirect('/account/settings/');

    var queryParams =
    {
      _id: { $ne: request.user.id }
    };

    queryParams[socialType + '.id'] = socialProfile.id;

    request.app.db.models.User.findOne(queryParams, function(error, user)
    {
      if (error)
        return next(error);

      if (user)
        return renderSettings(request, response, next, errorMessage);

      // Add a social account record.
      SocialAccountConnector.addSocialAccount(request.user, socialProfile, function(error, user)
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
  var socialId = user.getSocialId(socialType);
  var schema = this.SCHEMA_MAP[socialType];

  // First delete the social account record.
  App.db.models[schema].remove({ "profile.id": socialId }, function(error, numModified)
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
 * fetchSocialAccount
 *******************************************************************************
 * Fetch a social account for a user.
 *
 * Inputs:
 *   user, socialType:
 *
 *   callback( error, socialAccount ):
 *     error - Error object
 *     socialAccount - Social Account object
 */
SocialAccountConnector.fetchSocialAccount = function(user, socialType, callback)
{
  var socialId = user.getSocialId(socialType);
  var schema = this.SCHEMA_MAP[socialType];

  App.db.models[schema].findOne({ "profile.id": socialId }, function(error, socialAccount)
  {
    if (error)
      return callback(error);

    return callback(null, socialAccount);
  } );
};

/*******************************************************************************
 * fetchSocialAccounts
 *******************************************************************************
 * Fetch all social accounts for a user.
 *
 * Inputs:
 *   user:
 *
 *   callback( error, socialAccounts ):
 *     error - Error object
 *     profiles - Social Account objects
 */
SocialAccountConnector.fetchSocialAccounts = function(user, callback)
{
  var socialAccountTypes = Object.keys(this.SCHEMA_MAP);
  var fetchSocialAccountFn = this.fetchSocialAccount;
  var fetchFunctions = {};

  socialAccountTypes.forEach(function(socialType)
  {
    var socialId = user.getSocialId(socialType);
    if (socialId)
      fetchFunctions[socialType] = fetchSocialAccountFn.bind(this, user, socialType);
  }, this );

  if (_.size(fetchFunctions) > 0)
  {
    async.parallel(fetchFunctions, function(error, results)
    {
      if (error)
        return callback(error);

      return callback(null, results);
    } );
  }
  else
    return callback(null, {});
};

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
    request.app.db.models.User.findById(request.user.id, 'username email twitter.id github.id facebook.id google.id').exec(function(error, user)
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
      oauthFacebookActive: outcome.user.facebook ? !!outcome.user.facebook.id : false,
      oauthGoogle: !!request.app.get('google-oauth-key'),
      oauthGoogleActive: outcome.user.google ? !!outcome.user.google.id : false
    });
  }

  async.parallel([getAccountData, getUserData], asyncFinally);
}
