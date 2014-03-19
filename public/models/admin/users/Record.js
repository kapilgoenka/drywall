//
//  Record.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//

var app = app || {};

app.Record = app.UserRecord = Backbone.Model.extend(
{
  idAttribute: '_id',

  defaults:
  {
    _id: undefined,
    username: '',
    email: '',
    isActive: 'yes'
  },

  url: function()
  {
    return '/admin/users/' + (this.isNew() ? '' : this.id + '/');
  }
});
