//
//  Record.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//

var app = app || {};

app.Record = app.EventRecord = Backbone.Model.extend(
{
  url: function()
  {
    if (window.location.pathname.indexOf('organizations') !== -1)
      return window.location.href + '/' + this.get('name');

    return '/admin/events/' + this.get('name');
  }
});
