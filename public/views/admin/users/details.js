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
    "/views/admin/users/details/User.js",
    "/views/admin/users/details/UserDelete.js",
    "/views/admin/users/details/UserIdentity.js",
    "/views/admin/users/details/UserSocial.js",
    "/views/admin/users/details/UserRoles.js",
    "/views/admin/users/details/UserPassword.js",
    "/views/admin/users/details/UserMainView.js"],
  function()
  {
    app.loadScripts([
      "/views/admin/users/details/UserHeaderView.js",
      "/views/admin/users/details/UserRolesView.js",
      "/views/admin/users/details/UserIdentityView.js",
      "/views/admin/users/details/UserSocialAccountsView.js",
      "/views/admin/users/details/UserPasswordView.js",
      "/views/admin/users/details/UserDeleteView.js"
    ], function()
    {
      app.mainView = new app.MainView();
    });
  });
});
