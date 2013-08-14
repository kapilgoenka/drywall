//
//  User.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=User.js
var app = app || {};

app.User = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    return '/admin/users/' + this.id + '/';
  }
});
