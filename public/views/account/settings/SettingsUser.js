//
//  SettingsUser.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsUser.js
var app = app || {};

app.User = Backbone.Model.extend(
{
  idAttribute: '_id',
  url: '/account/settings'
});
