//
//  AdministratorsDelete.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsDelete.js
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
    return '/admin/administrators/' + app.mainView.model.id + '/';
  }
});
