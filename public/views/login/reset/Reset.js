//
//  Reset.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Reset.js
var app = app || {};

app.Reset = Backbone.Model.extend(
{
  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    id: undefined,
    password: '',
    confirm: ''
  },

  url: function()
  {
    return '/login/reset/'+ this.id +'/';
  }
});
