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
    screen_name: ' ',
    friends_count: ' ',
    followers_count: ' ',
    created_at: ' ',
    verified: ' ',
    lang: ' ',
    email: ''
  },

  initialize: function(options)
  {
  },

  url: function()
  {
    return '/admin/twitter/' + (this.isNew() ? '' : this.id + '/');
  }
});
