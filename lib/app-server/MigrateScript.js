var MigrateScript = module.exports;
var Config = require('app-server/config');
var App = require('app').app;
var _ = require('underscore');
var async = require('async');

MigrateScript.initMigrate = function(callback)
{
  App.db.forEach('users', '_id', function(user)
  {
    user.displayName = user.displayName || user.username;
  }, function(error, results)
  {
    if (error)
    {
      console.log('error updating users');
      return callback(error);
    }

    callback(null, 'done');
  });
}