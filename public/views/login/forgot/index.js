//
//  index.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/views/login/forgot/Forgot.js",
    "/views/login/forgot/ForgotView.js"],
  function()
  {
    app.forgotView = new app.ForgotView();
  });
});
