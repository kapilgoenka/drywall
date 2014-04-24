//
//  AccountDetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=EventDetailsView.js
/*jshint loopfunc: true */

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
    // render
    this.$el.html(this.template(this.model.toJSON()));

    // set selected tab
    this.selectedTab = this.selectedTab || 1;

    _(this.model.toJSON().event.properties).each(function(data, key)
    {
      var columnTitles = [];
      var columnValues = [];

      // display will be in a table, so make sure data is
      // in array format
      data = _(data).isArray() ? data : [data];

      // array of strings
      if (typeof data[0] === 'string')
      {
        columnValues = data.map(function(v)
        {
          return [v];
        });
      }
      // array of objects
      else
      {
        var elementWithMaxProperties = _.max(data, function(row)
        {
          return _(row).size();
        });

        columnTitles = _(elementWithMaxProperties).keys();

        columnValues = data.map(function(v)
        {
          var row = [];

          _(columnTitles).each(function(columnTitle)
          {
            if (!v[columnTitle])
              row.push('');

            else if (_(v[columnTitle]).isString())
              row.push(v[columnTitle]);

            else if (_(v[columnTitle]).isObject())
              row.push('<pre>' + JSON.stringify(v[columnTitle], null, 4) + '</pre>');
          });
          return row;
        });
      }

      // Generate Table from the JSON data
      this.$el.find('.' + key + '-container').TidyTable(
      {
        columnTitles: columnTitles,
        columnValues: columnValues,
        postProcess:
        {
          table: function(table)
          {
            table.css({
              'margin-top': '20px',
              'margin-bottom': '20px'
            });

            table.find('td,th').css({
              'border':'1px solid #CCCCCC',
              // 'max-width': columnTitles.length > 6 ? '400px' : '1000px',
              'max-width': '400px',
              'overflow': 'scroll'
            });
          }
        }
      });
    }, this);

    $('.btn-update').hide();
    $('.nav-tabs li:nth-child(' + this.selectedTab + ')').addClass('active');
    $('.tab-content div:nth-child(' + this.selectedTab + ')').addClass('active in');

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('.btn-edit').text('Edit');
    });
  },

  update: function()
  {
    var self = this;
    var key = $('.nav-tabs li.active a').text();
    var val = JSON.parse($('.tab-pane.active textarea').val());

    $.ajax(
    {
      url: this.model.url() + key,
      type: 'POST',
      data: JSON.stringify(val),
      contentType: 'application/json',
      success: function(data, textStatus, jqXHR)
      {
        self.model.toJSON().event.properties[key] = val;
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
      $('.tab-pane.active table').hide();
      $('.tab-pane.active textarea').remove();
      $('.tab-pane.active').append('<textarea rows="20" style="width:100%;margin-bottom:20px;"></textarea>');
      $('.tab-pane.active textarea').text(JSON.stringify(this.model.toJSON().event.properties[$('.tab-pane.active').attr('id')], null, 4));
    }
    else
    {
      $('.btn-update').hide();
      $('.btn-edit').text('Edit');
      $('.tab-pane.active table').show();
      $('.tab-pane.active textarea').remove();
      this.selectedTab = $('.nav-tabs li.active').index() + 1;
      this.render();
    }
  }
});
