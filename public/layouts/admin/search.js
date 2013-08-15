//
//  search.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/layouts/admin/SearchResult.js",
    "/layouts/admin/SearchCollection.js",
    "/layouts/admin/SearchView.js",
    "/layouts/admin/SearchResultView.js"],
  function()
  {
    app._searchView = new app._SearchView();
  });
});
