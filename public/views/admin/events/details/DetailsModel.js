//
//  DetailsModel.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=DetailsModel.js
var app = app || {};

app.DetailsModel = Backbone.Model.extend(
{
  idAttribute: '_id',

  url: function()
  {
    if (window.location.pathname.indexOf('organizations') !== -1)
    {
      var orgName = _(window.location.pathname.split('/')).last();
      return '/admin/organizations/'+ orgName;
    }
    if (this.get('partner'))
      return '/admin/events/'+ this.get('partner').replace(/ /g, '_') + '/' + this.get('event').name;
    else
      return '/admin/events/'+ this.get('event').name;
  },

  parse: function(response)
  {
    return response;
  }
});
