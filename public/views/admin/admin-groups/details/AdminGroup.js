//
//  AdminGroup.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroup.js
var app = app || {};

app.AdminGroup = Backbone.Model.extend(
{
    idAttribute: '_id',

    url: function()
    {
      return '/admin/admin-groups/'+ this.id +'/';
    }
});
