//
//  Search.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var Search = module.exports;

var App = require('app').app,
    async = require('async');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a group.
 *
 * Inputs:
 *   request, response, next:
 */
Search.find = function(request, response, next)
{
  // Defaults
  request.query.q = request.query.q ? request.query.q : '';
  var regexQuery = new RegExp('^.*?'+ request.query.q +'.*$', 'i');

  // Results container
  var outcome = {};

  function searchUsers(callback)
  {
    App.db.find('users', { username: request.query.q }, function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.users = results;
      callback(null, 'done');
    });
  }

  function searchAccounts(callback)
  {
    App.db.find('accounts', { username: request.query.q }, function(error, results)
    {
      if (error)
        callback(error, null);

      outcome.accounts = results;
      return callback(null, 'done');
    });
  }

  function searchTwitterAccounts(callback)
  {
    App.db.find('twitter_accounts', { username: request.query.q }, function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.twitter = results;
      callback(null, 'done');
    });
  }

  function searchFacebookAccounts(callback)
  {
    App.db.find('facebook_accounts', { username: request.query.q }, function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.facebook = results;
      callback(null, 'done');
    });
  }

  function searchGoogleAccounts(callback)
  {
    App.db.find('google_accounts', { username: request.query.q }, function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.google = results;
      callback(null, 'done');
    });
  }

  function searchAdministrators(callback)
  {
    App.db.find('admins', { username: request.query.q }, function(error, results)
    {
      if (error)
        callback(error, null);

      outcome.administrators = results;
      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

    response.send(outcome);
  }

  async.parallel([searchUsers, searchAccounts, searchTwitterAccounts, searchFacebookAccounts, searchGoogleAccounts, searchAdministrators], asyncFinally);
};
