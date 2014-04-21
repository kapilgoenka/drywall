//
//  RecordCollection.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//

var app = app || {};

app.RecordCollection = Backbone.Collection.extend(
{
  model: app.UserRecord,

  url: '/admin/users/',

  parse: function(results)
  {
    app.pagingView.model.set(
    {
      pages: results.pages,
      items: results.items
    });

    app.filterView.model.set(results.filters);

    return results.data;
  }
});
