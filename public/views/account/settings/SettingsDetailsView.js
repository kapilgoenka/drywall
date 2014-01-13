//
//  SettingsDetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsDetailsView.js
var app = app || {};

app.DetailsView = Backbone.View.extend(
{
  el: '#details',

  template: _.template($('#tmpl-details').html()),

  events:
  {
    'click .btn-update': 'update'
  },

  initialize: function()
  {
    this.model = new app.Details();
    this.syncUp();
    app.mainView.account.bind('change', this.syncUp, this);

    this.model.on('change', this.render, this);
    this.render();
  },

  syncUp: function()
  {
    this.model.set(
    {
      _id: app.mainView.account.id,
      first: app.mainView.user.get('firstName'),
      last: app.mainView.user.get('lastName')
      // first: app.mainView.account.get('name').first,
      // middle: app.mainView.account.get('name').middle,
      // last: app.mainView.account.get('name').last,
      // company: app.mainView.account.get('company'),
      // phone: app.mainView.account.get('phone'),
      // zip: app.mainView.account.get('zip')
    });
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));

    //set input values
    for (var key in this.model.attributes)
      this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
  },

  update: function()
  {
    this.model.save(
    {
      first: this.$el.find('[name="first"]').val(),
      last: this.$el.find('[name="last"]').val()
      // first: this.$el.find('[name="first"]').val(),
      // middle: this.$el.find('[name="middle"]').val(),
      // last: this.$el.find('[name="last"]').val(),
      // company: this.$el.find('[name="company"]').val(),
      // phone: this.$el.find('[name="phone"]').val(),
      // zip: this.$el.find('[name="zip"]').val()
    });
  }
});
