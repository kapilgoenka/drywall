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
    "/views/admin/administrators/details/Admin.js",
    "/views/admin/administrators/details/AdministratorsDelete.js",
    "/views/admin/administrators/details/AdministratorsDetails.js",
    "/views/admin/administrators/details/AdministratorsLogin.js",
    "/views/admin/administrators/details/AdministratorsGroups.js",
    "/views/admin/administrators/details/AdministratorsPermissions.js",
    "/views/admin/administrators/details/AdministratorsHeaderView.js",
    "/views/admin/administrators/details/AdministratorsDetailsView.js",
    "/views/admin/administrators/details/AdministratorsDeleteView.js",
    "/views/admin/administrators/details/AdministratorsLoginView.js",
    "/views/admin/administrators/details/AdministratorsGroupsView.js",
    "/views/admin/administrators/details/AdministratorsPermissionsView.js",
    "/views/admin/administrators/details/AdministratorsMainView.js"],
  function()
  {
    app.mainView = new app.MainView();
  });
});
