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

  initialize: function(options)
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
      isActive: app.mainView.model.getIsActive(),
      username: app.mainView.model.getUsername(),
      email: app.mainView.model.getEmail(),
      organization: app.mainView.model.getOrganization().toUpperCase()
    });
  },

  render: function()
  {
    this.$el.html(this.template(this.model.toJSON()));
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
