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
      twitter: app.mainView.model.get('twitter'),
      facebook: app.mainView.model.get('facebook'),
      google: app.mainView.model.get('google'),
      socialAccounts: app.mainView.model.get('socialAccounts')
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

  twitterOpen: function()
  {
    location.href = '/admin/twitter/' + this.model.get('socialAccounts').twitter._id + '/';
  },

  twitterUnlink: function()
  {
    this.socialUnlink("twitter");
  },

  facebookOpen: function()
  {
    location.href = '/admin/facebook/' + this.model.get('socialAccounts').facebook._id + '/';
  },

  facebookUnlink: function()
  {
    this.socialUnlink("facebook");
  },

  googleOpen: function()
  {
    location.href = '/admin/google/' + this.model.get('socialAccounts').google._id + '/';
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
