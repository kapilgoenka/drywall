//
//  AdminGroupDetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdminGroupDetailsView.js
var app = app || {};

app.DetailsView = Backbone.View.extend(
{
  el: '#details',

  template: _.template($('#tmpl-details').html()),

  events:
  {
    'click .btn-update': 'update'
  },

  initialize: function()
  {
    this.model = new app.Details();
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
      name: app.mainView.model.get('name')
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

  update: function()
  {
    this.model.save({ name: this.$el.find('[name="name"]').val() });
  }
});
