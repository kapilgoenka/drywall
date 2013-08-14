var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/models/admin/admin-groups/Record.js",
    "/models/admin/admin-groups/RecordCollection.js",
    "/models/admin/admin-groups/Filter.js",
    "/models/admin/Paging.js",
    "/views/admin/HeaderView.js",
    "/views/admin/admin-groups/AdminGroupsHeaderView.js",
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
