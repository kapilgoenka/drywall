//
//  Record.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//

var app = app || {};

app.Record = app.OrganizationRecord = Backbone.Model.extend(
{
  url: function()
  {
    return '/admin/organizations/' + this.get('urlName');
  }
});
