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

    App.db.findAll(this.dbSchema, function(error, results)
    {
      if (error)
        return next(error);

      if (request.isAjaxRequest)
      {
        response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        results.filters = request.query;
        response.send(results);
      }
      else
      {
        results.filters = request.query;
        return response.render(adminURI + 'index', { data: { results: JSON.stringify(results) } });
      }
    });
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

    App.db.findOne(this.dbSchema, request.params.id, function(error, socialAccount)
    {
      if (error)
        return next(error);

      if (request.isAjaxRequest)
        response.send(socialAccount);
      else
        response.render(adminURI + 'details', { data: { record: JSON.stringify(socialAccount) } });
    });
  }

  return SocialAdmin;
})();
