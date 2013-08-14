//
//  AppRouter.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AppRouter.js
var app = app || {};

app.AppRouter = Backbone.Router.extend(
{
  routes:
  {
    '': 'default',
    'q/:params': 'query'
  },

  initialize: function()
  {
    app.mainView = new app.MainView();
  },

  default: function()
  {
    if (!app.firstLoad)
      app.resultsView.collection.fetch({ reset: true });

    app.firstLoad = false;
  },

  query: function(params)
  {
    app.resultsView.collection.fetch({ data: params, reset: true });
    app.firstLoad = false;
  }
});
