//
//  HeaderView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=HeaderView.js
var app = app || {};

app.HeaderView = Backbone.View.extend(
{
  el: '#header',

  template: Handlebars.compile($('#tmpl-header').html()),

  initialize: function(options)
  {
    this.model = app.mainView.model;
    this.model.on('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
  }
});
