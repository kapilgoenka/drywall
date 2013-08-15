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
    "/views/account/settings/SettingsAccount.js",
    "/views/account/settings/SettingsUser.js",
    "/views/account/settings/SettingsDetails.js",
    "/views/account/settings/SettingsIdentity.js",
    "/views/account/settings/SettingsPassword.js",
    "/views/account/settings/SettingsDetailsView.js",
    "/views/account/settings/SettingsIdentityView.js",
    "/views/account/settings/SettingsPasswordView.js",
    "/views/account/settings/SettingsMainView.js"],
  function()
  {
    app.mainView = new app.MainView();
  });
});
