//
//  AdministratorsLoginView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsLoginView.js
var app = app || {};

app.LoginView = Backbone.View.extend(
{
  el: '#login',

  template: _.template($('#tmpl-login').html()),

  events:
  {
    'click .btn-user-open': 'userOpen',
    'click .btn-user-link': 'userLink',
    'click .btn-user-unlink': 'userUnlink'
  },

  initialize: function()
  {
    this.model = new app.Login();
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
      id: app.mainView.model.get('user').id,
      name: app.mainView.model.get('user').name
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

  userOpen: function()
  {
    location.href = '/admin/users/' + this.model.get('id');
  },

  userLink: function()
  {
    this.model.save({ newUsername: $('[name="newUsername"]').val() });
  },

  userUnlink: function()
  {
    if (confirm('Are you sure?'))
    {
      this.model.destroy(
      {
        success: function(model, response, options)
        {
          if (response.admin)
          {
            app.mainView.model.set(response.admin);
            delete response.admin;
          }

          app.loginView.model.set(response);
        }
      });
    }
  }
});
