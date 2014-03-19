//
//  UserPasswordView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserPasswordView.js

var app = app || {};

app.PasswordView = Backbone.View.extend(
{
  el: '#password',

  template: _.template($('#tmpl-password').html()),

  events:
  {
    'click .btn-password': 'updatePassword'
  },

  initialize: function()
  {
    this.model = new app.Password({ _id: app.mainView.model.id });
    this.model.on('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.toJSON()));
  },

  updatePassword: function()
  {
    this.model.save(
    {
      newPassword: this.$el.find('[name="newPassword"]').val(),
      confirm: this.$el.find('[name="confirm"]').val()
    });
  }
});
