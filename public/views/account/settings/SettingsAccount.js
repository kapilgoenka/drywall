//
//  SettingsAccount.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsAccount.js
var app = app || {};

app.Account = Backbone.Model.extend(
{
  idAttribute: '_id',
  url: '/account/settings/'
});
