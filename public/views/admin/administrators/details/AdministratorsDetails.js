//
//  AdministratorsDetails.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsDetails.js
var app = app || {};

app.Details = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    success: false,
    errors: [],
    errfor: {},
    first: '',
    middle: '',
    last: ''
  },

  url: function()
  {
    return '/admin/administrators/' + app.mainView.model.id + '/';
  },

  parse: function(response)
  {
    if (response.admin)
    {
      app.mainView.model.set(response.admin);
      delete response.admin;
    }

    return response;
  }
});
