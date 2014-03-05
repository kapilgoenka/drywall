//
//  SocialIdentityView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SocialIdentityView.js
var app = app || {};

app.IdentityView = Backbone.View.extend(
{
  el: '#identity',

  template: Handlebars.compile($('#tmpl-identity').html()),

  events:
  {
    'click .btn-user-open': 'userOpen'
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
    this.model.set(app.mainView.model.toJSON());
  },

  userOpen: function()
  {
    location.href = '/admin/users/' + this.model.get('userId') + '/';
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));
  }
});
