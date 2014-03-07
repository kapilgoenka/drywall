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

    App.db.findOne('users', 'c479599d-2bb3-4fa2-bd64-60115aa825b6', function(error, user)
    {
      if (error)
      {
        console.log('error fetching user');
        return callback(error);
      }

      user.password = App.encryptPassword('1234');

      App.db.update('users', user._id, user, function(error, user)
      {
        if (error)
        {
          console.log('error updating user');
          return callback(error);
        }
        callback(null, 'done');
      });
    });
  });
}