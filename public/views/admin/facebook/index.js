/**
 * SETUP
 **/
  var app = app || {};



/**
 * MODELS
 **/
  app.Record = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      id: '',
      name: '',
      first_name: ' ',
      last_name: ' ',
      username: ' ',
      link: ' ',
      gender: ' ',
      timezone: ' ',
      locale: ' ',
      verified: ' ',
      email: ''
    },
    url: function() {
      return '/admin/facebook/'+ (this.isNew() ? '' : this.id +'/');
    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: '/admin/facebook/',
    parse: function(results) {
      app.pagingView.model.set({
        pages: results.pages,
        items: results.items
      });
      app.filterView.model.set(results.filters);
      return results.data;
    }
  });

  app.Filter = Backbone.Model.extend({
    defaults: {
      username: '',
      roles: '',
      isActive: '',
      sort: '',
      limit: ''
    }
  });

  app.Paging = Backbone.Model.extend({
    defaults: {
      pages: {},
      items: {}
    }
  });



/**
 * VIEWS
 **/
  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'addNewOnEnter',
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Record();
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    preventSubmit: function(event) {
      event.preventDefault();
    }
  });

  app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {
      this.collection = new app.RecordCollection( app.mainView.results.data );
      this.collection.on('reset', this.render, this);
      this.render();
    },
    render: function() {
      this.$el.html( this.template() );

      this.collection.each(function(record) {
        var view = new app.ResultsRowView({ model: record });
        $('#results-rows').append( view.render().$el );
      }, this);

      if (this.collection.length == 0) {
        $('#results-rows').append( $('#tmpl-results-empty-row').html() );
      }
    }
  });

  app.ResultsRowView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template( $('#tmpl-results-row').html() ),
    events: {
      'click .btn-details': 'viewDetails'
    },
    viewDetails: function() {
      location.href = this.model.url();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
      return this;
    }
  });

  app.FilterView = Backbone.View.extend({
    el: '#filters',
    template: _.template( $('#tmpl-filters').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'filterOnEnter',
      'change select': 'filter'
    },
    initialize: function() {
      this.model = new app.Filter( app.mainView.results.filters );
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));

      //set field values
      for(var key in this.model.attributes) {
        this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
      }
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    filterOnEnter: function(event) {
      if (event.keyCode != 13) return;
      this.filter();
    },
    filter: function() {
      var query = $('#filters form').serialize();
      Backbone.history.navigate('q/'+ query, { trigger: true });
    }
  });

  app.PagingView = Backbone.View.extend({
    el: '#results-paging',
    template: _.template( $('#tmpl-results-paging').html() ),
    events: {
      'click .btn-page': 'goToPage'
    },
    initialize: function() {
      this.model = new app.Paging({ pages: app.mainView.results.pages, items: app.mainView.results.items });
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      if (this.model.get('pages').total > 1) {
        this.$el.html(this.template( this.model.attributes ));

        if (!this.model.get('pages').hasPrev) {
          this.$el.find('.btn-prev').attr('disabled', 'disabled');
        }
        if (!this.model.get('pages').hasNext) {
          this.$el.find('.btn-next').attr('disabled', 'disabled');
        }
      }
      else {
        this.$el.empty();
      }
    },
    goToPage: function(event) {
      var query = $('#filters form').serialize() +'&page='+ $(event.target).data('page');
      Backbone.history.navigate('q/'+ query, { trigger: true });
      var body = $('body').scrollTop(0);
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;

      //setup data
      this.results = JSON.parse( $('#data-results').html() );

      //sub views
      app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
      app.filterView = new app.FilterView();
      app.pagingView = new app.PagingView();
    }
  });



/**
 * ROUTER
 **/
  app.Router = Backbone.Router.extend({
    routes: {
      '': 'default',
      'q/:params': 'query'
    },
    initialize: function() {
      app.mainView = new app.MainView();
    },
    default: function() {
      if (!app.firstLoad) app.resultsView.collection.fetch({ reset: true });
      app.firstLoad = false;
    },
    query: function(params) {
      app.resultsView.collection.fetch({ data: params, reset: true });
      app.firstLoad = false;
    }
  });



/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
  });