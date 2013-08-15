//
//  Signup.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Signup.js
var app = app || {};

app.Signup = Backbone.Model.extend(
{
  url: '/signup/',

  defaults:
  {
    errors: [],
    errfor: {},
    username: '',
    email: '',
    password: ''
  }
});
