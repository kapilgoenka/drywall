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
    '/views/admin/events/details/DetailsModel.js',
    '/views/admin/events/details/HeaderView.js',
    '/views/admin/events/details/DetailsView.js',
    '/views/admin/events/details/MainView.js',
    '/views/admin/AppRouter.js'
  ],
  function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
