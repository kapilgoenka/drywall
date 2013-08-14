//
//  Record.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.Record = Backbone.Model.extend(
{
  idAttribute: "_id",

  defaults:
  {
    _id: undefined,
    'name.full': ''
  },

  initialize: function(options)
  {
  },

  url: function()
  {
    return '/admin/administrators/' + (this.isNew() ? '' : this.id + '/');
  }
});
