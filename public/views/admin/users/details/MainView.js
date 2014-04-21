//
//  MainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=MainView.js

var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function(options)
  {
    app.mainView = this;

    //setup model
    this.model = new app.User(JSON.parse($('#data-record').html()));

    //sub views
    app.headerView = new app.HeaderView();
    app.identityView = new app.IdentityView();
    app.socialAccountsView = new app.SocialAccountsView();
    app.passwordView = new app.PasswordView();
    app.rolesView = new app.RolesView();
    app.deleteView = new app.DeleteView();
  }
});
