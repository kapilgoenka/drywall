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
    'click .btn-password': 'password'
  },

  initialize: function()
  {
    this.model = new app.Password({ _id: app.mainView.model.id });
    this.model.on('change', this.render, this);
    this.render();
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));

    //set input values
    for (var key in this.model.attributes)
      this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
  },

  password: function()
  {
    this.model.save(
    {
      newPassword: this.$el.find('[name="newPassword"]').val(),
      confirm: this.$el.find('[name="confirm"]').val()
    });
  }
});
