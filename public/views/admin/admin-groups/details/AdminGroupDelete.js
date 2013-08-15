//
//  AdminGroupDelete.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroupDelete.js
var app = app || {};

app.Delete = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {}
  },

  url: function()
  {
    return '/admin/admin-groups/' + app.mainView.model.id + '/';
  }
});
