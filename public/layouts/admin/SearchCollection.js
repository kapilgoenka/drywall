//
//  SearchCollection.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=SearchCollection.js
var app = app || {};

app._SearchCollection = Backbone.Collection.extend(
{
  model: app._SearchResult,

  url: '/admin/search/',

  responseFields:
  {
    users: { title: "Users", name: function(data) { return data.username; } },
    accounts: { title: "Accounts", name: function(data) { return data.name.full; } },
    twitter: { title: "Twitter", name: function(data) { return data.profile.screen_name; } },
    facebook: { title: "Facebook", name: function(data) { return data.profile.name; } },
    google: { title: "Google", name: function(data) { return data.profile.name; } },
    administrators: { title: "Administrators", name: function(data) { return data.name.full; } }
  },

  parse: function(response)
  {
    var outcome = [];

    _.each(this.responseFields, function(fieldDesc, field)
    {
      var responseForField = response[field];

      if (responseForField.length > 0)
      {
        outcome.push({ name: fieldDesc.title, type: 'header' });

        _.each(responseForField, function(data)
        {
          outcome.push(
          {
            name: fieldDesc.name(data),
            url: '/admin/' + field +'/' + data._id + '/'
          });
        });
      }
    } );

    return outcome;
  }
});
