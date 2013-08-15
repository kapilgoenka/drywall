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

  parse: function(response)
  {
    var outcome = [];

    if (response.users.length)
      outcome.push({ name: 'Users', type: 'header' });

    _.each(response.users, function(user)
    {
      outcome.push(
      {
        name: user.username,
        url: '/admin/users/' + user._id + '/'
      });
    });

    if (response.accounts.length)
      outcome.push({ name: 'Accounts', type: 'header' });

    _.each(response.accounts, function(account)
    {
      outcome.push(
      {
        name: account.name.full,
        url: '/admin/accounts/' + account._id + '/'
      });
    });

    if (response.twitter.length)
      outcome.push({ name: 'Twitter', type: 'header' });

    _.each(response.twitter, function(twitter)
    {
      outcome.push(
      {
        name: twitter.profile.screen_name,
        url: '/admin/twitter/' + twitter._id + '/'
      });
    });

    if (response.facebook.length)
      outcome.push({ name: 'Facebook', type: 'header' });

    _.each(response.facebook, function(facebook)
    {
      outcome.push(
      {
        name: facebook.profile.name,
        url: '/admin/facebook/' + facebook._id + '/'
      });
    });

    if (response.administrators.length)
      outcome.push({ name: 'Administrators', type: 'header' });

    _.each(response.administrators, function(administrator)
    {
      outcome.push(
      {
        name: administrator.name.full,
        url: '/admin/administrators/' + administrator._id + '/'
      });
    });

    return outcome;
  }
});
