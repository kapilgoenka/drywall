//
//  SocialSignupView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SocialSignupView.js
var app = app || {};

app.SignupView = Backbone.View.extend(
{

  el: '#signup',

  template: _.template($('#tmpl-signup').html()),

  events:
  {
    'submit form': 'preventSubmit',
    'keypress [name="password"]': 'signupOnEnter',
    'click .btn-signup': 'signup'
  },

  initialize: function()
  {
    this.model = new app.Signup();
    this.model.set('email', $('#data-email').text());
    this.model.set('password', $('#data-password').text());
    this.model.bind('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
    this.$el.find('[name="email"]').focus();
  },

  preventSubmit: function(event)
  {
    event.preventDefault();
  },

  signupOnEnter: function(event)
  {
    if (event.keyCode != 13)
      return;

    event.preventDefault();
    this.signup();
  },

  signup: function()
  {
    this.$el.find('.btn-signup').attr('disabled', true);

    this.model.save(
    {
      email: this.$el.find('[name="email"]').val(),
      password: this.$el.find('[name="password"]').val()
    },
    {
      success: function(model, response, options)
      {
        if (response.success)
          location.href = '/account/';
        else
          model.set(response);
      }
    });
  }
});
