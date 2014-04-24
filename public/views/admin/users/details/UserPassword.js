//
//  UserPassword.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserPassword.js

var app = app || {};

app.Password = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    newPassword: '',
    confirm: ''
  },

  url: function()
  {
    return '/admin/users/' + app.mainView.model.id + '/password';
  },

  parse: function(response)
  {
    if (response.user)
    {
      app.mainView.model.set(response.user);
      delete response.user;
    }

    return response;
  }
});
