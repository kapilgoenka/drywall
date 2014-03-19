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
  model: app.EventRecord,

  url: '/admin/events/',

  parse: function(results)
  {
    return results.data;
  }
});
