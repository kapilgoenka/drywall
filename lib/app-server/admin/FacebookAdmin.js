//
//  FacebookAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var FacebookAdmin = module.exports;

var App = require('app').app;

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
FacebookAdmin.find = function(request, response, next)
{
  // Defaults
  request.query.username = request.query.username ? request.query.username : '';
  request.query.limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;
  request.query.page = request.query.page ? parseInt(request.query.page, 10) : 1;
  request.query.sort = request.query.sort ? request.query.sort : '_id';

  // Filters
  var filters = {};

  if (request.query.username)
    filters.username = new RegExp('^.*?'+ request.query.username +'.*$', 'i');

  // Get results.
  request.app.db.models.FacebookAccount.pagedFind(
  {
    filters: filters,
//    keys: 'profile.id profile.name profile.screen_name',
    limit: request.query.limit,
    page: request.query.page,
    sort: request.query.sort
  }, function(error, results)
  {
    if (error)
      return next(error);

    if (request.xhr)
    {
      response.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = request.query;
      return response.send(results);
    }
    else
    {
      results.filters = request.query;
      return response.render('admin/facebook/index', { data: { results: JSON.stringify(results) } });
    }
  } );
};
