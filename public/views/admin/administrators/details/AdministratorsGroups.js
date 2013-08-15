//
//  AdministratorsGroups.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsGroups.js
var app = app || {};

app.Groups = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    groups: [],
    newMembership: ''
  },

  url: function()
  {
    return '/admin/administrators/' + app.mainView.model.id + '/groups/';
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
