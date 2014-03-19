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
  initialize: function(options)
  {
    this.template = _.template($(options.templateSelector).html());
    this.collection = new app.RecordCollection(options.results, { model: options.model });
    this.collection.on('reset', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template());

    this.collection.each(function(record)
    {
      var view = new app.ResultsRowView(
      {
        model: record,
        templateSelector: this.options.rowTemplateSelector
      });

      $(this.options.resultContentSelector).append(view.render().$el);
    }, this);

    $.bootstrapSortable();

    if (!this.collection.length)
      $(this.options.resultContentSelector).append($('#tmpl-results-empty-row').html());
  }
});
