//
//  AdministratorsLogin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsLogin.js
var app = app || {};

app.Login = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    id: '',
    name: '',
    newUsername: ''
  },

  url: function()
  {
    return '/admin/administrators/' + app.mainView.model.id + '/user/';
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
