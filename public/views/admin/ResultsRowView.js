//
//  ResultsRowView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=ResultsRowView.js
var app = app || {};

app.ResultsRowView = Backbone.View.extend(
{
  tagName: 'tr',

  template: _.template($('#tmpl-results-row').html()),

  events: {
    'click .btn-details': 'viewDetails'
  },

  viewDetails: function()
  {
    location.href = this.model.url();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});
