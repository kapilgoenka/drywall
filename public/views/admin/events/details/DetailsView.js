//
//  DetailsView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=DetailsView.js
/*jshint loopfunc: true */

var app = app || {};

app.DetailsView = Backbone.View.extend(
{
  el: '#details',

  template: Handlebars.compile($('#tmpl-details').html()),

  events:
  {
    'click .btn-update': 'update',
    'click .btn-edit': 'edit',
    'click .btn-upload-csv': 'uploadCsv',
    'change #csv-file-input': 'csvInputChange'
  },

  initialize: function()
  {
    this.model = app.mainView.model;
    this.model.on('change', this.render, this);
    this.render();
    this.reader = new FileReader();
  },

  csvInputChange: function($event)
  {
    var self = this;

    self.reader.onload = function(e)
    {
      var text = self.reader.result;
      text = text.replace(/\r/g, "\n")
      CSVParser.resetLog();
      var parseOutput = CSVParser.parse(text, "checked", "auto", false, false);

      if (parseOutput.errors)
      {
        alert('Errors in input!');
        return;
      }

      var jsonStr = CSVParser.json(parseOutput.dataGrid, parseOutput.headerNames, parseOutput.headerTypes, "  ", "\n");
      $('.tab-pane.active textarea').text(jsonStr);
    }
    self.reader.readAsText($event.currentTarget.files[0]);
  },

  render: function()
  {
    var self = this;

    // render
    var data = _.extend({}, this.model.toJSON());
    data.sortedEventProperties = Object.keys(data.event.properties).sort();
    data.hasProperties = data.sortedEventProperties.length > 0;
    data.isGenericEvent = this.model.get('partner') === undefined;
    data.showPartnerSelection = window.location.pathname.indexOf('organizations') === -1;
    this.$el.html(this.template(data));

    if (this.model.get('partner'))
    {
      $('#partner-selection').val(this.model.get('partner'));
      $('#display-msg').text('Event propeties specific to ' + this.model.get('partner'));
    }

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

        if (elementWithMaxProperties)
          columnTitles = _(elementWithMaxProperties).keys();
        else
          columnTitles = [];

        columnValues = data.map(function(v)
        {
          var row = [];

          if (!columnTitles.length)
            return ['No value entered'];

          _(columnTitles).each(function(columnTitle)
          {
            if (!v[columnTitle])
              row.push('No value entered');

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
              'border':'1px solid #CCCCCC'
            });
          }
        }
      });
    }, this);

    $('.btn-update').hide();
    $('.btn-upload-csv').hide();
    $('.nav-tabs li:nth-child(' + this.selectedTab + ')').addClass('active');
    $('.tab-content div:nth-child(' + this.selectedTab + ')').addClass('active in');

    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
      $('.tab-pane.active table').show();
      $('.tab-pane.active textarea').remove();
      $('.btn-edit').text('Edit');
    });

    $('.btn-add-property').click(function()
    {
      var newProperty = prompt('Enter property name');

      if (newProperty)
      {
        $.ajax(
        {
          url: self.model.url() + '/' + newProperty,
          type: 'POST',
          data: JSON.stringify({}),
          contentType: 'application/json',
          success: function(data, textStatus, jqXHR)
          {
            window.location.reload();
          },
          error: function(data, textStatus, jqXHR)
          {
            alert(data.responseText);
          }
        });
      }
    });

    $('.btn-rm-property').click(function()
    {
      var newProperty = prompt('Enter property name');

      if (newProperty)
      {
        $.ajax(
        {
          url: self.model.url() + '/' + newProperty,
          type: 'DELETE',
          success: function(data, textStatus, jqXHR)
          {
            window.location.reload();
          },
          error: function(data, textStatus, jqXHR)
          {
            alert(data.responseText);
          }
        });
      }
    });

    $('#partner-selection').change(function()
    {
      if ($(this).val() === 'Select Partner')
      {
        $('#display-msg').text('Event properties common across all partners');
        self.model.unset('partner', { silent: true });
      }
      else
      {
        $('#display-msg').text('Event propeties specific to ' + $(this).val());
        self.model.set('partner', $(this).val(), { silent: true });
      }

      self.model.fetch();
    });
  },

  update: function()
  {
    var self = this;
    var key = $('.nav-tabs li.active a').text();
    var val = JSON.parse($('.tab-pane.active textarea').val());

    $.ajax(
    {
      url: this.model.url() + '/' + key,
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

  uploadCsv: function()
  {
    if (window.File && window.FileReader && window.FileList && window.Blob)
    {
      var $fileSelector = $('#csv-file-input');
      $fileSelector.click();
    }
    else
    {
      alert('The File APIs are not fully supported in this browser.');
      return;
    }
  },

  edit: function()
  {
    if ($('.btn-edit').text() === 'Edit')
    {
      $('.btn-edit').text('Cancel');
      $('.btn-update').show();
      $('.btn-upload-csv').show();
      $('.tab-pane.active table').hide();
      $('.tab-pane.active textarea').remove();
      $('.tab-pane.active').append('<textarea rows="20" style="width:100%;margin-top:20px;margin-bottom:20px;"></textarea>');
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
