//
//  ResultsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=ResultsView.js
var app = app || {};

app.ResultsView = Backbone.View.extend(
{
  el: '#results-table',

  template: _.template($('#tmpl-results-table').html()),

  initialize: function()
  {
    this.collection = new app.RecordCollection(app.mainView.results.data);
    this.collection.on('reset', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template());

    this.collection.each(function(record)
    {
      var view = new app.ResultsRowView({ model: record });
      $('#results-rows').append(view.render().$el);
    }, this );

    if (this.collection.length == 0)
      $('#results-rows').append($('#tmpl-results-empty-row').html());
  }
});
