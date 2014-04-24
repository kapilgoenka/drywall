//
//  UserRolesView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=UserRolesView.js
var app = app || {};

app.RolesView = Backbone.View.extend(
{
  el: '#roles',

  template: _.template($('#tmpl-accounts').html()),

  events:
  {
    'click .btn-admin-open': 'adminOpen',
    'click .btn-admin-link': 'adminLink',
    'click .btn-admin-unlink': 'adminUnlink',
    'click .btn-account-open': 'accountOpen',
    'click .btn-account-link': 'accountLink',
    'click .btn-account-unlink': 'accountUnlink'
  },

  initialize: function()
  {
    this.model = new app.Roles();
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
      accounts: app.mainView.model.get('accounts')
    });
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));

    //set input values
    for (var key in this.model.attributes)
      this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
  },

  adminOpen: function()
  {
    location.href = '/admin/administrators/' + this.model.get('accounts').admin._id;
  },

  adminLink: function()
  {
    this.model.save({ newAdminId: $('[name="newAdminId"]').val() }, { url: this.model.url() + 'role-admin' });
  },

  adminUnlink: function()
  {
    if (confirm('Are you sure?'))
    {
      this.model.destroy(
      {
        url: this.model.url() + 'role-admin',

        success: function(model, response, options)
        {
          if (response.user)
          {
            app.mainView.model.set(response.user);
            delete response.user;
          }

          app.rolesView.model.set(response);
        }
      });
    }
  },

  accountOpen: function()
  {
    // location.href = '/admin/accounts/' + this.model.get('accounts').account._id + '/';
    location.href = '/admin/accounts/' + this.model.get('accounts').media_curation;
  },

  accountLink: function()
  {
    this.model.save({ newAccountId: $('[name="newAccountId"]').val() }, { url: this.model.url() + 'role-account' });
  },

  accountUnlink: function()
  {
    if (confirm('Are you sure?'))
    {
      this.model.destroy(
      {
        url: this.model.url() + 'role-account',

        success: function(model, response, options)
        {
          if (response.user)
          {
            app.mainView.model.set(response.user);
            delete response.user;
          }

          app.rolesView.model.set(response);
        }
      });
    }
  }
});
