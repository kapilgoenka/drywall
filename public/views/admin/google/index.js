var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/models/admin/google/Record.js",
    "/models/admin/google/RecordCollection.js",
    "/models/admin/google/Filter.js",
    "/models/admin/Paging.js",
    "/views/admin/SocialHeaderView.js",
    "/views/admin/ResultsRowView.js",
    "/views/admin/ResultsView.js",
    "/views/admin/FilterView.js",
    "/views/admin/PagingView.js",
    "/views/admin/MainView.js",
    "/views/admin/AppRouter.js"],
  function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
