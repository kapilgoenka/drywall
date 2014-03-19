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

  initialize: function(options)
  {
    app.mainView = this;

    //sub views
    app.headerView = new app.HeaderView();

    app.resultsView = new app.ResultsView(
    {
      el: '#results-table',
      templateSelector: '#tmpl-results-table',
      rowTemplateSelector: '#tmpl-results-row',
      resultContentSelector: '#results-rows',
      results: JSON.parse($('#data-results').html()),
      model: app.Record
    });

    // app.filterView = new app.FilterView();
    // app.pagingView = new app.PagingView();
  }
});
