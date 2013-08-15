//
//  AdministratorsPermissions.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsPermissions.js
var app = app || {};

app.Permissions = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    permissions: [],
    newPermission: ''
  },

  url: function()
  {
    return '/admin/administrators/' + app.mainView.model.id + '/permissions/';
  },

  parse: function(response)
  {
    if (response.admin)
    {
      app.mainView.model.set(response.admin);
      delete response.admin;
    }

    return response;
  }
});
