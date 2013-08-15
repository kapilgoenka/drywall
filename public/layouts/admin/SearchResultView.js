//
//  SearchResultView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SearchResultView.js
var app = app || {};

app._SearchResultView = Backbone.View.extend(
{
  tagName: 'li',

  template: _.template($('#tmpl-_search-results-row').html()),

  events:
  {
    'click .btn-details': 'goTo'
  },

  goTo: function()
  {
    location.href = this.model.get('url');
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));

    if (this.model.get('type') === 'header')
      this.$el.addClass('nav-header');

    return this;
  }
});
