//
//  HeaderView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=HeaderView.js
var app = app || {};

app.HeaderView = Backbone.View.extend(
{
  el: '#header',

  template: _.template($('#tmpl-header').html()),

  events:
  {
    'submit form': 'preventSubmit',
    'keypress input[type="text"]': 'addNewOnEnter',
    'click .btn-add': 'addNew'
  },

  initialize: function()
  {
    this.model = new app.Record();
    this.model.bind('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));
  },

  preventSubmit: function(event)
  {
    event.preventDefault();
  },

  addNewOnEnter: function(event)
  {
    if (event.keyCode != 13)
      return;

    event.preventDefault();
    this.addNew();
  },

  findUsername: function()
  {
    return this.$el.find('[name="name"]').val();
  },

  addNew: function()
  {
    if (this.findUsername() == '')
      alert('Please enter a name.');
    else
    {
      this.model.save({ 'name.full': this.findUsername() },
      {
        success: function(model, response, options)
        {
          if (response.success)
          {
            model.id = response.record._id;
            location.href = model.url();
          }
          else
            alert(response.errors.join('\n'));
        }
      });
    }
  }
});
