var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    '/models/admin/users/Record.js',
    '/models/admin/users/RecordCollection.js',
    '/views/admin/HeaderView.js',
    '/views/admin/ResultsRowView.js',
    '/views/admin/ResultsView.js',
    '/views/admin/MainView.js',
    '/views/admin/AppRouter.js'
    // '/views/admin/users/UsersHeaderView.js',
    // '/models/admin/users/Filter.js',
    // '/models/admin/Paging.js',
    // '/views/admin/FilterView.js',
    // '/views/admin/PagingView.js',
  ], function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
