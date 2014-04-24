//
//  SettingsPassword.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsPassword.js
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

    url: '/account/settings/password',

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
