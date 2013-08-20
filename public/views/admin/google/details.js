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
    "/views/admin/google/details/Google.js",
    "/views/admin/google/details/GoogleIdentity.js",
    "/views/admin/social-details/DetailsSocialHeaderView.js",
    "/views/admin/social-details/SocialIdentityView.js",
    "/views/admin/social-details/SocialMainView.js"],
  function()
  {
    app.mainView = new app.MainView( { socialType: "Google" });
  });
});
