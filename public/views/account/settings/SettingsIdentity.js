//
//  SettingsIdentity.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsIdentity.js
var app = app || {};

app.Identity = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    username: '',
    email: ''
  },

  url: '/account/settings/identity',

  parse: function(response)
  {
    if (response.user)
    {
      app.mainView.user.set(response.user);
      delete response.user;
    }

    return response;
  }
});
