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
    'click .btn-facebook-open': 'facebookOpen',
    'click .btn-twitter-unlink': 'twitterUnlink',
    'click .btn-facebook-unlink': 'facebookUnlink'
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

  facebookOpen: function()
  {
    location.href = '/admin/facebook/' + this.model.get('socialAccounts').facebook._id + '/';
  },

  twitterUnlink: function()
  {
    this.socialUnlink("twitter");
  },

  facebookUnlink: function()
  {
    this.socialUnlink("facebook");
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
