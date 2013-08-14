//
//  Paging.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.Paging = Backbone.Model.extend(
{
  defaults:
  {
    pages: {},
    items: {}
  }
});
