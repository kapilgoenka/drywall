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
    request.app.db.models.User.find({ search: regexQuery }, 'username').sort('username').limit(10).lean().exec(function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.users = results;
      callback(null, 'done');
    });
  }

  function searchAccounts(callback)
  {
    request.app.db.models.Account.find({ search: regexQuery }, 'name.full').sort('name.full').limit(10).lean().exec(function(error, results)
    {
      if (error)
        callback(error, null);

      outcome.accounts = results;
      return callback(null, 'done');
    });
  }

  function searchAdministrators(callback)
  {
    request.app.db.models.Admin.find({ search: regexQuery }, 'name.full').sort('name.full').limit(10).lean().exec(function(error, results)
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

  async.parallel([searchUsers, searchAccounts, searchAdministrators], asyncFinally);
};
