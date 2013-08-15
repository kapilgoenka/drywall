//
//  AccountLogin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AccountLogin.js
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
    return '/admin/accounts/'+ app.mainView.model.id +'/user/';
  },

  parse: function(response)
  {
    if (response.account)
    {
      app.mainView.model.set(response.account);
      delete response.account;
    }

    return response;
  }
});
