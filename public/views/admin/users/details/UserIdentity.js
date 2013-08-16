//
//  UserIdentity.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserIdentity.js
var app = app || {};

app.Identity = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    isActive: '',
    username: '',
    email: '',
    twitter: {},
    facebook: {},
    socialAccounts: {}
  },

  url: function()
  {
    return '/admin/users/' + app.mainView.model.id + '/';
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
