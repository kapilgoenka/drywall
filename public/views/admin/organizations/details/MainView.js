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

    //sub views
    app.headerView = new app.HeaderView();

    app.usersView = new app.ResultsView(
    {
      el: '#results-table',
      templateSelector: '#tmpl-results-table',
      rowTemplateSelector: '#tmpl-results-row',
      resultContentSelector: '#results-rows',
      results: JSON.parse($('#data-results').html()),
      model: app.UserRecord
    });

    app.allEventsView = new app.ResultsView(
    {
      el: '#all-events-table',
      templateSelector: '#tmpl-generic-events-table',
      rowTemplateSelector: '#tmpl-generic-events-row',
      resultContentSelector: '#generic-events-rows',
      results: JSON.parse($('#data-events').html()).all,
      model: app.EventRecord
    });

    // app.allEventsView
    // app.filterView = new app.FilterView();
    // app.pagingView = new app.PagingView();
  }
});
