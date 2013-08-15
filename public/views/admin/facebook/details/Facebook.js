//
//  Facebook.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Facebook.js
var app = app || {};

app.Facebook = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    console.log('url = /admin/facebook/' + this.id +'/');
    return '/admin/facebook/'+ this.id +'/';
  }
});
