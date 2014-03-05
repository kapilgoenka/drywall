//
//  ResetView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=ResetView.js
var app = app || {};

app.ResetView = Backbone.View.extend(
{
  el: '#reset',

  template: Handlebars.compile($('#tmpl-reset').html()),

  events:
  {
    'submit form': 'preventSubmit',
    'keypress [name="confirm"]': 'resetOnEnter',
    'click .btn-reset': 'reset'
  },

  initialize: function()
  {
    this.model.bind('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
    this.$el.find('[name="password"]').focus();
    return this;
  },

  preventSubmit: function(event)
  {
    event.preventDefault();
  },

  resetOnEnter: function(event)
  {
    if (event.keyCode != 13)
      return;

    event.preventDefault();
    this.reset();
  },

  reset: function()
  {
    this.$el.find('.btn-reset').attr('disabled', true);

    this.model.save(
    {
      password: this.$el.find('[name="password"]').val(),
      confirm: this.$el.find('[name="confirm"]').val()
    });
  }
});
