//
//  AccountDetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AccountDetailsView.js
var app = app || {};

app.DetailsView = Backbone.View.extend(
{
  el: '#details',

  template: Handlebars.compile($('#tmpl-details').html()),

  events:
  {
    'click .btn-update': 'update'
  },

  initialize: function()
  {
    this.model = new app.Details();
    this.syncUp();
    app.mainView.model.bind('change', this.syncUp, this);

    this.model.on('change', this.render, this);
    this.render();
  },

  syncUp: function()
  {
    this.model.set(app.mainView.model.toJSON());
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));

    //set input values
    for (var key in this.model.attributes.events)
      this.$el.find('[name="' + key + '"]').html(JSON.stringify(this.model.attributes.events[key], null, 4));
      // this.$el.find('[name="' + key + '"]').val(JSON.stringify(this.model.attributes.events[key]));
  },

  update: function()
  {
    this.model.save(
    {
      first: this.$el.find('[name="first"]').val(),
      middle: this.$el.find('[name="middle"]').val(),
      last: this.$el.find('[name="last"]').val(),
      company: this.$el.find('[name="company"]').val(),
      phone: this.$el.find('[name="phone"]').val(),
      zip: this.$el.find('[name="zip"]').val()
    });
  }
});
