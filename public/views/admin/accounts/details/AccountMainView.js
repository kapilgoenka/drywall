//
//  AccountMainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AccountMainView.js
var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function()
  {
    app.mainView = this;

    //setup model
    this.model = new app.Account(JSON.parse($('#data-record').html()));

    //sub views
    app.headerView = new app.HeaderView();
    app.detailsView = new app.DetailsView();
    // app.deleteView = new app.DeleteView();
    // app.loginView = new app.LoginView();
  }
});
