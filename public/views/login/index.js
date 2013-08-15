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
    "/views/login/Login.js",
    "/views/login/LoginView.js"],
  function()
  {
    app.loginView = new app.LoginView();
  });
});
