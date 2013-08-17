//
//  UserSocial.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserSocial.js
var app = app || {};

app.Social = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
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
