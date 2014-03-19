var app = app || {};

$(document).ready(function()
{
  app.loadScripts([
    "/models/admin/organizations/Record.js",
    "/models/admin/organizations/RecordCollection.js",
    "/views/admin/HeaderView.js",
    "/views/admin/ResultsRowView.js",
    "/views/admin/ResultsView.js",
    "/views/admin/MainView.js",
    "/views/admin/AppRouter.js"],
  function()
  {
    app.firstLoad = true;
    app.router = new app.AppRouter();
    Backbone.history.start();
  });
});
