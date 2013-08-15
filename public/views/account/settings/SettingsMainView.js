//
//  SettingsMainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SettingsMainView.js
var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function()
  {
    app.mainView = this;

    //setup model
    this.account = new app.Account(JSON.parse($('#data-account').html()));
    this.user = new app.User(JSON.parse($('#data-user').html()));

    //sub views
    app.detailsView = new app.DetailsView();
    app.identityView = new app.IdentityView();
    app.passwordView = new app.PasswordView();
  }
});
