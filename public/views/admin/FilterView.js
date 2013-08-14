//
//  FilterView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=FilterView.js
var app = app || {};

app.FilterView = Backbone.View.extend(
{
  el: '#filters',

  template: _.template($('#tmpl-filters').html()),

  events:
  {
    'submit form': 'preventSubmit',
    'keypress input[type="text"]': 'filterOnEnter',
    'change select': 'filter'
  },

  initialize: function()
  {
    this.model = new app.Filter(app.mainView.results.filters);
    this.model.bind('change', this.render, this);
    this.render();
  },

  render: function()
  {
    this.$el.html(this.template(this.model.attributes));

    //set field values
    for (var key in this.model.attributes)
    {
      this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
    }
  },

  preventSubmit: function(event)
  {
    event.preventDefault();
  },

  filterOnEnter: function(event)
  {
    if (event.keyCode != 13)
      return;
    this.filter();
  },

  filter: function()
  {
    var query = $('#filters form').serialize();
    Backbone.history.navigate('q/' + query, {
      trigger: true
    });
  }
});
