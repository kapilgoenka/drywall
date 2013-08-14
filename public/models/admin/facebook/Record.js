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
    id: '',
    name: '',
    first_name: ' ',
    last_name: ' ',
    username: ' ',
    link: ' ',
    gender: ' ',
    timezone: ' ',
    locale: ' ',
    verified: ' ',
    email: ''
  },

  initialize: function(options)
  {
  },

  url: function()
  {
    return '/admin/facebook/' + (this.isNew() ? '' : this.id + '/');
  }
});
