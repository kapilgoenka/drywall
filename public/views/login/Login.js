//
//  Login.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Login.js
var app = app || {};

app.Login = Backbone.Model.extend(
{
  url: '/login/',

  defaults:
  {
    errors: [],
    errfor: {},
    username: '',
    password: ''
  }
});
