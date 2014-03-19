//
//  details.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/views/admin/accounts/details/Account.js",
    "/views/admin/accounts/details/AccountDelete.js",
    "/views/admin/accounts/details/AccountDetails.js",
    // "/views/admin/accounts/details/AccountLogin.js",
    "/views/admin/accounts/details/AccountHeaderView.js",
    "/views/admin/accounts/details/AccountDetailsView.js",
    // "/views/admin/accounts/details/AccountDeleteView.js",
    // "/views/admin/accounts/details/AccountLoginView.js",
    "/views/admin/accounts/details/AccountMainView.js"
  ],
  function()
  {
    app.mainView = new app.MainView();
  });
});
