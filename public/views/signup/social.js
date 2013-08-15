//
//  social.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/views/signup/SocialSignup.js",
    "/views/signup/SocialSignupView.js"],
  function()
  {
    app.signupView = new app.SignupView();
  });
});
