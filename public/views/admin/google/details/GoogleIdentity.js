//
//  GoogleIdentity.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=GoogleIdentity.js
var app = app || {};

app.Identity = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    profile: {}
  },

  url: function()
  {
    return '/admin/google/' + app.mainView.model.id + '/';
  },

  parse: function(response)
  {
    console.log('response = ' + JSON.stringify(response));

    if (response.user)
    {
      app.mainView.model.set(response.user);
      delete response.user;
    }

    return response;
  }
});
