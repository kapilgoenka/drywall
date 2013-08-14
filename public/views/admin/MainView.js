//
//  MainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=MainView.js
var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function()
  {
    app.mainView = this;

    //setup data
    this.results = JSON.parse($('#data-results').html());

    //sub views
    app.headerView = new app.HeaderView();
    app.resultsView = new app.ResultsView();
    app.filterView = new app.FilterView();
    app.pagingView = new app.PagingView();
  }
});
