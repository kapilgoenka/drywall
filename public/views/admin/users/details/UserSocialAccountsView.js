//
//  UserSocialAccountsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserSocialAccountsView.js

var app = app || {};

app.SocialAccountsView = Backbone.View.extend(
{
  el: '#social',

  template: _.template($('#tmpl-social').html()),

  events:
  {
    'click .btn-twitter-open': 'twitterOpen',
    'click .btn-twitter-unlink': 'twitterUnlink',

    'click .btn-facebook-open': 'facebookOpen',
    'click .btn-facebook-unlink': 'facebookUnlink',

    'click .btn-google-open': 'googleOpen',
    'click .btn-google-unlink': 'googleUnlink'
  },

  initialize: function()
  {
    this.model = new app.Social();
    app.mainView.model.bind('change', this.syncUp, this);
    this.model.on('change', this.render, this);
    this.syncUp();
  },

  syncUp: function()
  {
    this.model.set(
    {
      _id: app.mainView.model.id,
      twitterId: app.mainView.model.getTwitterId(),
      facebookId: app.mainView.model.getFacebookId(),
      googleId: app.mainView.model.getGoogleId()
    });
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
  },

  twitterOpen: function()
  {
    location.href = '/admin/twitter/' + this.model.getTwitterId() + '/';
  },

  facebookOpen: function()
  {
    location.href = '/admin/facebook/' + this.model.getFacebookId() + '/';
  },

  googleOpen: function()
  {
    location.href = '/admin/google/' + this.model.getGoogleId() + '/';
  },

  twitterUnlink: function()
  {
    this.socialUnlink("twitter");
  },

  facebookUnlink: function()
  {
    this.socialUnlink("facebook");
  },

  googleUnlink: function()
  {
    this.socialUnlink("google");
  },

  socialUnlink: function(socialType)
  {
    if (confirm('Are you sure?'))
    {
      this.model.destroy(
      {
        url: this.model.url() + socialType + '/',

        success: function(model, response, options)
        {
          if (response.user)
          {
            app.mainView.model.set(response.user);
            delete response.user;
          }

          app.socialAccountsView.model.set(response);
        }
      });
    }
  }
});
