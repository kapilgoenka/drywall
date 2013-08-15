//
//  index.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/views/login/reset/Reset.js",
    "/views/login/reset/ResetView.js",
    "/views/login/reset/ResetRouter.js"],
  function()
  {
    app.router = new app.Router();
    Backbone.history.start({ pushState: true });
  });
});
