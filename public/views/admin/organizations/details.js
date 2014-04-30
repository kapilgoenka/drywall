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
    '/models/admin/users/Record.js',
    '/models/admin/users/RecordCollection.js',
    '/views/admin/HeaderView.js',
    '/views/admin/ResultsRowView.js',
    '/views/admin/ResultsView.js',
    '/views/admin/events/details/DetailsModel.js',
    '/views/admin/events/details/DetailsView.js',
    '/views/admin/organizations/details/MainView.js',
    '/views/admin/AppRouter.js'

  ], function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
