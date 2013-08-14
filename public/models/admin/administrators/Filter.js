//
//  Filter.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.Filter = Backbone.Model.extend(
{
  defaults:
  {
    name: '',
    sort: '',
    limit: ''
  }
});
