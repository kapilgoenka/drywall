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
/*
  initialize: function()
  {
    console.log('User.initialize');
  },

  set: function()
  {
    var setArguments = Array.prototype.slice.call(arguments);
    Backbone.Model.prototype.set.apply(this, setArguments);
  },
*/
  url: function()
  {
    return '/admin/users/' + this.id + '/';
  }
});
