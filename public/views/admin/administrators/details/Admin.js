//
//  Admin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Admin.js
var app = app || {};

app.Admin = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    return '/admin/administrators/'+ this.id +'/';
  }
});
