//
//  AccountDetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=AccountDetailsView.js
var app = app || {};

app.DetailsView = Backbone.View.extend(
{
  el: '#details',

  template: Handlebars.compile($('#tmpl-details').html()),

  events:
  {
    'click .btn-update': 'update',
    'click .btn-edit': 'edit'
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
    this.model.set(app.mainView.model.toJSON());
  },

  render: function()
  {
    //render
    this.$el.html(this.template(this.model.attributes));

    //set input values
    for (var key in this.model.attributes.event.properties)
      this.$el.find('[name="' + key + '"]').html(JSON.stringify(this.model.toJSON().event.properties[key], null, 4));

    $('.btn-update').hide();
    $('.nav-tabs li:first-child').addClass('active');
    $('.tab-content div:first-child').addClass('active');

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('.btn-edit').text('Edit');
    });
  },

  update: function()
  {
    var update = {};
    var key = $('.nav-tabs li:first-child a').text();
    var val = JSON.parse($('.tab-pane.active textarea').text());
    update[key] = val;
    // this.model.save(update);

    $.ajax(
    {
      url: this.model.url(),
      type: 'POST',
      data: update,
      dataType: 'json',
      success: function(data, textStatus, jqXHR)
      {
        $('.btn-edit').click();
      },
      error: function(data, textStatus, jqXHR)
      {
        $('.btn-edit').click();
      }
    });
  },

  edit: function()
  {
    if ($('.btn-edit').text() === 'Edit')
    {
      $('.btn-edit').text('Cancel');
      $('.btn-update').show();
      $('.tab-pane.active pre').hide();
      $('.tab-pane.active textarea').remove();
      $('.tab-pane.active').append('<textarea rows="20" style="width:100%"></textarea>');
      $('.tab-pane.active textarea').text($('.tab-pane.active pre').text());
    }
    else
    {
      $('.btn-update').hide();
      $('.btn-edit').text('Edit');
      $('.tab-pane.active pre').show();
      $('.tab-pane.active textarea').remove();
    }
  }
});
