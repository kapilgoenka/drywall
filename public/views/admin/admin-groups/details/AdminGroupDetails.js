//
//  AdminGroupDetails.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroupDetails.js
var app = app || {};

app.Details = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    name: ''
  },

  url: function()
  {
    return '/admin/admin-groups/' + app.mainView.model.id + '/';
  },

  parse: function(response)
  {
    if (response.adminGroup)
    {
      app.mainView.model.set(response.adminGroup);
      delete response.adminGroup;
    }
    return response;
  }
});
