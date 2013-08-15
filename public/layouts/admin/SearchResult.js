//
//  SearchResult.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SearchResult.js
var app = app || {};

app._SearchResult = Backbone.Model.extend(
{
  defaults:
  {
    _id: undefined,
    name: '---',
    url: '---',
    type: 'result'
  }
});
