var MigrateScript = module.exports;
var Config = require('app-server/config');
var App = require('app').app;
var _ = require('underscore');

MigrateScript.initMigrate = function(callback)
{
  App.db.fetchAllMediaCurationAccounts(function(error, mediaCurationAccounts)
  {
    _(mediaCurationAccounts).each(function(account)
    {
      App.db.findOne(account, 'savedQueries', function(error, savedQueries)
      {
        _(savedQueries).each(function(value, key)
        {
          App.db.update(account, key, { savedQueries: value }, function(){});
        });
        App.db.remove(account, 'savedQueries', function(){});
      });
    });
  });

  // App.db.findOne('users', 'c479599d-2bb3-4fa2-bd64-60115aa825b6', function(error, user)
  // {
  //   if (error)
  //   {
  //     console.log('error fetching user');
  //     return callback(error);
  //   }

  //   user.password = App.encryptPassword('1234');

  //   App.db.update('users', user._id, user, function(error, user)
  //   {
  //     callback(null, 'done');
  //   });
  // });
}