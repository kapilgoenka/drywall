//
//  Twitter.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=Twitter.js
var app = app || {};

app.Twitter = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    console.log('url = /admin/twitter/' + this.id +'/');
    return '/admin/twitter/'+ this.id +'/';
  }
});
