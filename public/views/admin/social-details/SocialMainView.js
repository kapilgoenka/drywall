//
//  SocialMainView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SocialMainView.js
var app = app || {};

app.MainView = Backbone.View.extend(
{
  el: '.page .container',

  initialize: function(options)
  {
    this.socialType = options.socialType;
    app.mainView = this;

    //setup model
    this.model = new app[this.socialType](JSON.parse($('#data-record').html()));
    console.log('model = ' + JSON.stringify(this.model));

    //sub views
    app.headerView = new app.HeaderView();
    app.identityView = new app.IdentityView();
  }
});
