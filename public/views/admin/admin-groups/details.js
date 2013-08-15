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
    "/views/admin/admin-groups/details/AdminGroup.js",
    "/views/admin/admin-groups/details/AdminGroupDelete.js",
    "/views/admin/admin-groups/details/AdminGroupDetails.js",
    "/views/admin/admin-groups/details/AdminGroupPermissions.js",
    "/views/admin/admin-groups/details/AdminGroupHeaderView.js",
    "/views/admin/admin-groups/details/AdminGroupDetailsView.js",
    "/views/admin/admin-groups/details/AdminGroupDeleteView.js",
    "/views/admin/admin-groups/details/AdminGroupPermissionsView.js",
    "/views/admin/admin-groups/details/AdminGroupMainView.js"],
  function()
  {
    app.mainView = new app.MainView();
  });
});
