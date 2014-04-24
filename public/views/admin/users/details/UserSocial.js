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
    google: {}
  },

  url: function()
  {
    return '/admin/users/' + app.mainView.model.id;
  },

  getTwitterId: function()
  {
    return this.get('twitterId');
  },

  getFacebookId: function()
  {
    return this.get('facebookId');
  },

  getGoogleId: function()
  {
    return this.get('googleId');
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
