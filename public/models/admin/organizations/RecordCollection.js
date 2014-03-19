//
//  RecordCollection.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.RecordCollection = Backbone.Collection.extend(
{
  model: app.OrganizationRecord,

  url: '/admin/organizations/',

  parse: function(results)
  {
    return results.data;
  }
});
