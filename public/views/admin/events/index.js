var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    '/models/admin/events/Record.js',
    '/models/admin/events/RecordCollection.js',
    // '/models/admin/accounts/Filter.js',
    // '/models/admin/Paging.js',
    '/views/admin/HeaderView.js',
    '/views/admin/ResultsRowView.js',
    '/views/admin/accounts/AccountsResultsRowView.js',
    '/views/admin/ResultsView.js',
    // '/views/admin/FilterView.js',
    // '/views/admin/PagingView.js',
    '/views/admin/MainView.js',
    '/views/admin/AppRouter.js'],
  function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
