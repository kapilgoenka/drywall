//
//  SocialAdmin.prototype.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var sa = module.exports;

var App = require('app').app,
    SocialAccountConnector = require('app-server/settings/SocialAccountConnector');

sa.SocialAdmin = (function()
{
  /*******************************************************************************
   * SocialAdmin()
   *******************************************************************************
   * Create a new instance of SocialAdmin.
   *
   * Inputs:
   *   options:
   */
  function SocialAdmin(options)
  {
    this.adminURI = 'admin/' + options.socialType + '/';
    this.dbSchema = SocialAccountConnector.SCHEMA_MAP[options.socialType];
  }

  /*******************************************************************************
   * find
   *******************************************************************************
   * Find a user.
   *
   * Inputs:
   *   request, response, next:
   */
  SocialAdmin.prototype.find = function(request, response, next)
  {
    var adminURI = this.adminURI;

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
    request.app.db.models[this.dbSchema].pagedFind(
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
        return response.render(adminURI + 'index', { data: { results: JSON.stringify(results) } });
      }
    } );
  };

  /*******************************************************************************
   * read
   *******************************************************************************
   * Fetch a Social account record.
   *
   * Inputs:
   *   request, response, next:
   */
  SocialAdmin.prototype.read = function(request, response, next)
  {
    var adminURI = this.adminURI;

    request.app.db.models[this.dbSchema].findById(request.params.id).exec(function(error, socialAccount)
    {
      if (error)
        return next(error);

      if (request.xhr)
        response.send(socialAccount);
      else
        response.render(adminURI + 'details', { data: { record: JSON.stringify(socialAccount) } });
    });
  }

  return SocialAdmin;
})();
