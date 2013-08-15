//
//  AdminGroupPermissionsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroupPermissionsView.js
var app = app || {};

app.PermissionsView = Backbone.View.extend(
{
  el: '#permissions',

  template: _.template($('#tmpl-permissions').html()),

  events:
  {
    'click .btn-add': 'add',
    'click .btn-allow': 'allow',
    'click .btn-deny': 'deny',
    'click .btn-delete': 'delete',
    'click .btn-set': 'savePermissions'
  },

  initialize: function()
  {
    this.model = new app.Permissions();
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
      permissions: app.mainView.model.get('permissions')
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

  add: function(event)
  {
    //validate
    var newPermission = this.$el.find('[name="newPermission"]').val().trim();

    if (!newPermission)
    {
      alert('Please enter a name.');
      return;
    }
    else
    {
      var alreadyAdded = false;

      _.each(this.model.get('permissions'), function(permission)
      {
        if (newPermission == permission.name)
          alreadyAdded = true;
      });

      if (alreadyAdded)
      {
        alert('That name already exists.');
        return;
      }
    }

    //add item
    this.model.get('permissions').push({ name: newPermission, permit: true });

    //sort
    var sorted = this.model.get('permissions');

    sorted.sort(function(a, b)
    {
      return a.name.toLowerCase() > b.name.toLowerCase();
    });

    this.model.set('permissions', sorted);

    //re-render
    this.render();
  },

  allow: function(event)
  {
    var idx = this.$el.find('.btn-allow').index(event.currentTarget);
    this.model.get('permissions')[idx].permit = true;
    this.render();
  },

  deny: function(event)
  {
    var idx = this.$el.find('.btn-deny').index(event.currentTarget);
    this.model.get('permissions')[idx].permit = false;
    this.render();
  },

  delete: function(event)
  {
    if (confirm('Are you sure?'))
    {
      var idx = this.$el.find('.btn-delete').index(event.currentTarget);
      this.model.get('permissions').splice(idx, 1);
      this.render();
    }
  },

  savePermissions: function()
  {
    this.model.save();
  }
});
