//
//  Google.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Google.js
var app = app || {};

app.Google = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    console.log('url = /admin/google/' + this.id +'/');
    return '/admin/google/'+ this.id +'/';
  }
});
