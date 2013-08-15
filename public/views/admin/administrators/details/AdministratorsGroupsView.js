//
//  AdministratorsGroupsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsGroupsView.js
var app = app || {};

app.GroupsView = Backbone.View.extend(
{
  el: '#groups',

  template: _.template($('#tmpl-groups').html()),

  events:
  {
    'click .btn-add': 'add',
    'click .btn-delete': 'delete',
    'click .btn-save': 'saveGroups'
  },

  initialize: function()
  {
    this.model = new app.Groups();
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
      groups: app.mainView.model.get('groups')
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
    var newMembership = this.$el.find('[name="newMembership"]').val();
    var newMembershipName = this.$el.find('[name="newMembership"] option:selected').text();

    if (!newMembership)
    {
      alert('Please select a group.');
      return;
    }
    else
    {
      var alreadyAdded = false;

      _.each(this.model.get('groups'), function(group)
      {
        if (newMembership == group._id)
          alreadyAdded = true;
      });

      if (alreadyAdded)
      {
        alert('That group already exists.');
        return;
      }
    }

    //add item
    this.model.get('groups').push({ _id: newMembership, name: newMembershipName });

    //sort
    var sorted = this.model.get('groups');

    sorted.sort(function(a, b)
    {
      return a.name.toLowerCase() > b.name.toLowerCase();
    });

    this.model.set('groups', sorted);

    //re-render
    this.render();
  },

  delete: function(event)
  {
    if (confirm('Are you sure?'))
    {
      var idx = this.$el.find('.btn-delete').index(event.currentTarget);
      this.model.get('groups').splice(idx, 1);
      this.render();
    }
  },

  saveGroups: function()
  {
    this.model.save();
  }
});
