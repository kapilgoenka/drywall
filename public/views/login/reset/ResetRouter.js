//
//  ResetRouter.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=ResetRouter.js
var app = app || {};

app.Router = Backbone.Router.extend(
{
  routes:
  {
    'login/reset/': 'start',
    'login/reset/:token/': 'start'
  },

  start: function(token)
  {
    app.resetView = new app.ResetView({ model: new app.Reset({ id: token }) });
  }
});
