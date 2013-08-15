//
//  FacebookIdentity.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=FacebookIdentity.js
var app = app || {};

app.Identity = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    id: '',
    name: '',
    first_name: ' ',
    last_name: ' ',
    username: ' ',
    link: ' ',
    gender: ' ',
    timezone: ' ',
    locale: ' ',
    verified: ' ',
    email: ''
  },

  url: function()
  {
    return '/admin/facebook/' + app.mainView.model.id + '/';
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
