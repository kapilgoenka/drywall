//
//  SettingsIdentityView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsIdentityView.js
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
    app.mainView.user.bind('change', this.syncUp, this);

    this.model.on('change', this.render, this);
    this.render();
  },

  syncUp: function()
  {
    this.model.set(
    {
      _id: app.mainView.user.id,
      username: app.mainView.user.get('username'),
      email: app.mainView.user.get('email')
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
      username: this.$el.find('[name="username"]').val(),
      email: this.$el.find('[name="email"]').val()
    });
  }
});
