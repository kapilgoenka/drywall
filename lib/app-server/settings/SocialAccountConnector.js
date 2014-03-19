//
//  SocialAccountConnector.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var SocialAccountConnector = module.exports,
    async = require('async'),
    uuid = require('node-uuid'),
    _ = require('underscore'),
    winston = require('winston'),
    log = winston.loggers.get('ss-account-default'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

SocialAccountConnector.SCHEMA_MAP =
{
  twitter: 'twitter_accounts',
  facebook: 'facebook_accounts',
  google: 'google_accounts'
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
    socialType: 'twitter',
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
    socialType: 'facebook',
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
    socialType: 'google',
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
    socialType: 'github',
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
  disconnectSocial({ socialType: 'twitter' }, request, response, next);
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
  disconnectSocial({ socialType: 'facebook' }, request, response, next);
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
  disconnectSocial({ socialType: 'google' }, request, response, next);
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
  disconnectSocial({ socialType: 'github' }, request, response, next);
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
SocialAccountConnector.addSocialAccount = function(userId, socialProfile, callback)
{
  var socialType = socialProfile.provider;
  var schema = this.SCHEMA_MAP[socialType];

  if (socialProfile._json)
    socialProfile._json.id = socialProfile._json.id + '';

  var socialAccountData =
  {
    _id: uuid.v4(),
    userId: userId,
    profile: socialProfile._json,
    search: getSearchKeysForSocialAccount(socialType, socialProfile._json)
  };

  // First create a new social account record.
  RiakDBAccessor.update(schema, socialAccountData._id, socialAccountData, function(error, account)
  {
    if (error)
      return callback(error);

    RiakDBAccessor.findOne('users', userId, function(error, user)
    {
      if (error || !user)
        return callback(error);

      user.social = user.social || {};
      user.social[socialType] = socialProfile.id + '';

      RiakDBAccessor.findOne('organizations', 'userMap', function(error, userMap)
      {
        if (userMap && userMap[user.social[socialType]])
          user.organization = userMap[user.social[socialType]];

        RiakDBAccessor.update('users', userId, user, callback);
      });
    });
  });
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

    var queryParams = {};
    queryParams[socialType + 'Id'] = socialProfile.id + '';

    RiakDBAccessor.findOne('users', queryParams, function(error, user)
    {
      if (error)
        return next(error);

      if (user)
        return renderSettings(request, response, next, errorMessage);

      // Add a social account record.
      SocialAccountConnector.addSocialAccount(request.user._id, socialProfile, function(error, user)
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
  var socialId = user.social && user.social[socialType];
  var schema = this.SCHEMA_MAP[socialType];

  // First delete the social account record.
  RiakDBAccessor.remove(schema, { profileId: socialId }, function(error)
  {
    return callback(error);
  });
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
  RiakDBAccessor.findOne('users', request.user._id, function(error, user)
  {
    if (error)
      return next(error);

    if (!user)
      return next('User not found!');

    SocialAccountConnector.removeSocialAccount(user, params.socialType, function(error)
    {
      if (error)
        return next(error);

      delete user.social[params.socialType];

      RiakDBAccessor.update('users', user._id, user, function(error, user)
      {
        if (error)
          return next(error);

        response.redirect('/account/settings/');
      });
    });
  });
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
  var socialId = user.social && user.social[socialType];
  var bucket = this.SCHEMA_MAP[socialType];

  RiakDBAccessor.findOne(bucket, { profileId: socialId }, function(error, socialAccount)
  {
    if (error)
      return callback(error);

    return callback(null, socialAccount);
  });
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
  var fetchFunctions = {};

  socialAccountTypes.forEach(function(socialAccountType)
  {
    var socialId = user.social && user.social[socialAccountType];

    if (socialId)
      fetchFunctions[socialAccountType] = this.fetchSocialAccount.bind(this, user, socialAccountType);
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
    RiakDBAccessor.findOne(request.accountBucket, request.user.accounts[request.appId], function(error, account)
    {
      if (error)
        return callback(error, null);

      outcome.account = account;
      return callback(null, 'done');
    });
  }

  function getUserData(callback)
  {
    outcome.user = request.user;
    callback(null, 'done');
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
      oauthTwitterActive: outcome.user.social ? !!outcome.user.social.twitter : false,
      oauthGitHub: !!request.app.get('github-oauth-key'),
      oauthGitHubActive: outcome.user.social ? !!outcome.user.social.github : false,
      oauthFacebook: !!request.app.get('facebook-oauth-key'),
      oauthFacebookActive: outcome.user.social ? !!outcome.user.social.facebook : false,
      oauthGoogle: !!request.app.get('google-oauth-key'),
      oauthGoogleActive: outcome.user.social ? !!outcome.user.social.google : false
    });
  }

  async.parallel([getUserData], asyncFinally);
}
