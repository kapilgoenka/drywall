//
//  Forgot.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Forgot.js
var app = app || {};

app.Forgot = Backbone.Model.extend(
{
  url: '/login/forgot/',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    email: '',
  }
});
