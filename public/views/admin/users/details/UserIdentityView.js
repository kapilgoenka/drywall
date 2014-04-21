//
//  UserIdentityView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserIdentityView.js
var app = app || {};

app.IdentityView = Backbone.View.extend(
{
  el: '#identity',

  template: _.template($('#tmpl-identity').html()),

  events:
  {
    'click .btn-update': 'update'
  },

  initialize: function()
  {
    this.model = new app.Identity();
    this.syncUp();
    app.mainView.model.bind('change', this.syncUp, this);

    this.model.on('change', this.render, this);
    this.render();
  },

  syncUp: function()
  {
    this.model.set(
    {
      _id: app.mainView.model.id,
      isActive: app.mainView.model.get('isActive'),
      username: app.mainView.model.get('username'),
      email: app.mainView.model.get('email'),
      organization: app.mainView.model.get('organization').toUpperCase().replace('_', ' ')
    });
  },

  render: function()
  {
    // Render
    this.$el.html(this.template(this.model.attributes));
/*
    // Set input values
    for (var key in this.model.attributes)
      this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
*/
  },

  update: function()
  {
    this.model.save(
    {
      isActive: this.$el.find('[name="isActive"]').val(),
      username: this.$el.find('[name="username"]').val(),
      email: this.$el.find('[name="email"]').val(),
      organization: this.$el.find('[name="organization"]').val().toLowerCase().replace(' ', '_')
    });
  }
});
