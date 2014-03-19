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
    '/views/admin/events/details/Event.js',
    '/views/admin/events/details/EventDetails.js',
    '/views/admin/events/details/EventHeaderView.js',
    '/views/admin/events/details/EventDetailsView.js',
    '/views/admin/events/details/EventMainView.js',
    '/models/admin/events/Record.js',
    '/models/admin/events/RecordCollection.js',
    '/views/admin/AppRouter.js'
  ],
  function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
