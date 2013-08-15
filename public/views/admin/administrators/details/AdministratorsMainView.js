//
//  AdministratorsMainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsMainView.js
var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function()
  {
    app.mainView = this;

    //setup model
    this.model = new app.Admin(JSON.parse($('#data-record').html()));

    //sub views
    app.headerView = new app.HeaderView();
    app.detailsView = new app.DetailsView();
    app.deleteView = new app.DeleteView();
    app.loginView = new app.LoginView();
    app.groupsView = new app.GroupsView();
    app.permissionsView = new app.PermissionsView();
  }
});
