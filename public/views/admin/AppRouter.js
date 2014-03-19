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

  initialize: function(options)
  {
    app.mainView = new app.MainView();

    $('.navbar li').removeClass('active');

    if (window.location.pathname.indexOf('organizations')!== -1)
      $('.navbar li.partners').addClass('active');

    if (window.location.pathname.indexOf('events')!== -1)
      $('.navbar li.events').addClass('active');

    if (window.location.pathname.indexOf('users')!== -1)
      $('.navbar li.users').addClass('active');
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
