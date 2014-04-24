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
    return '/admin/users/' + this.id;
  },

  getIsActive: function()
  {
    return this.get('isActive');
  },

  getUsername: function()
  {
    return this.get('username');
  },

  getEmail: function()
  {
    return this.get('email');
  },

  getTwitterId: function()
  {
    return this.get('social') ? this.get('social').twitter : '';
  },

  getFacebookId: function()
  {
    return this.get('social') ? this.get('social').facebook : '';
  },

  getGoogleId: function()
  {
    return this.get('social') ? this.get('social').google : '';
  },

  getOrganization: function()
  {
    return (this.get('organization') || '').replace('_', ' ');
  }
});
