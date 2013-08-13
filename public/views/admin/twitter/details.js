/**
 * SETUP
 **/
  var app = app || {};



/**
 * MODELS
 **/
  app.Twitter = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      console.log('url = /admin/twitter/' + this.id +'/');
      return '/admin/twitter/'+ this.id +'/';
    }
  });

  app.Identity = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      id: '',
      name: '',
      screen_name: ' ',
      friends_count: ' ',
      followers_count: ' ',
      created_at: ' ',
      verified: ' ',
      lang: ' ',
      email: ''
    },
    url: function() {
      return '/admin/twitter/'+ app.mainView.model.id +'/';
    },
    parse: function(response) {
      console.log('response = ' + JSON.stringify(response));

      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }
      return response;
    }
  });

/**
 * VIEWS
 **/
  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    initialize: function() {
      this.model = app.mainView.model;
      this.model.on('change', this.render, this);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    }
  });

  app.IdentityView = Backbone.View.extend({
    el: '#identity',
    template: _.template( $('#tmpl-identity').html() ),
    events: {
    },
    initialize: function() {
      this.model = new app.Identity();
      this.syncUp();
      app.mainView.model.bind('change', this.syncUp, this);

      this.model.on('change', this.render, this);
      this.render();
    },

    syncUp: function()
    {
      this.model.set(app.mainView.model.toJSON());
    },
    render: function() {
      //render
      this.$el.html(this.template( this.model.attributes ));

      // Set input values
      var profile = this.model.get('profile')
//      for(var key in this.model.attributes) {
      for(var key in profile) {
//        this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
        this.$el.find('[name="'+ key +'"]').val(profile[key]);
      }
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;

      //setup model
      this.model = new app.Twitter( JSON.parse($('#data-record').html()) );
      console.log('model = ' + JSON.stringify(this.model));

      //sub views
      app.headerView = new app.HeaderView();
      app.identityView = new app.IdentityView();
    }
  });



/**
 * BOOTUP
 **/
  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
