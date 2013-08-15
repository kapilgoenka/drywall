//
//  SocialSignup.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SocialSignup.js
var app = app || {};

app.Signup = Backbone.Model.extend(
{
  url: '/signup/social/',

  defaults:
  {
    errors: [],
    errfor: {},
    email: '',
    password: ''
  }
});
