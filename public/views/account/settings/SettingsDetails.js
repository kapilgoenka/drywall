//
//  SettingsDetails.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsDetails.js
var app = app || {};

app.Details = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    first: '',
    middle: '',
    last: '',
    company: '',
    phone: '',
    zip: ''
  },

  url: '/account/settings/',

  parse: function(response)
  {
    if (response.account)
    {
      app.mainView.account.set(response.account);
      delete response.account;
    }

    return response;
  }
});
