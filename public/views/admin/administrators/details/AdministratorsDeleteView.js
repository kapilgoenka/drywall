//
//  AdministratorsDeleteView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AdministratorsDeleteView.js
var app = app || {};

app.DeleteView = Backbone.View.extend(
{
  el: '#delete',

  template: _.template($('#tmpl-delete').html()),

  events:
  {
    'click .btn-delete': 'delete',
  },

  initialize: function()
  {
    this.model = new app.Delete({ _id: app.mainView.model.id });
    this.model.on('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
  },

  delete: function()
  {
    if (confirm('Are you sure?'))
    {
      this.model.destroy(
      {
        success: function(model, response, options)
        {
          if (response.success)
            location.href = '/admin/administrators/';
          else
            app.deleteView.model.set(response);
        }
      });
    }
  }
});
