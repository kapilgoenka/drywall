//
//  Account.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Account.js
var app = app || {};

app.Account = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    return '/admin/accounts/'+ this.id +'/';
  }
});
