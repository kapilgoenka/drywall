//
//  PagingView.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
//@ sourceURL=PagingView.js
var app = app || {};

app.PagingView = Backbone.View.extend(
{
  el: '#results-paging',

  template: _.template($('#tmpl-results-paging').html()),

  events:
  {
    'click .btn-page': 'goToPage'
  },

  initialize: function()
  {
    this.model = new app.Paging(
    {
      pages: app.mainView.results.pages,
      items: app.mainView.results.items
    });

    this.model.bind('change', this.render, this);
    this.render();
  },

  render: function()
  {
    if (this.model.get('pages').total > 1)
    {
      this.$el.html(this.template(this.model.attributes));

      if (!this.model.get('pages').hasPrev)
        this.$el.find('.btn-prev').attr('disabled', 'disabled');

      if (!this.model.get('pages').hasNext)
        this.$el.find('.btn-next').attr('disabled', 'disabled');
    }
    else
      this.$el.empty();
  },

  goToPage: function(event)
  {
    var query = $('#filters form').serialize() + '&page=' + $(event.target).data('page');
    Backbone.history.navigate('q/' + query, { trigger: true });
    var body = $('body').scrollTop(0);
  }
});
