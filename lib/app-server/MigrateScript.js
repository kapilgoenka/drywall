var MigrateScript = module.exports;
var App = require('app').app;
var _ = require('underscore');

MigrateScript.initMigrate = function(callback)
{
  App.db.findAll('facebooks_accounts', function(error, results)
  {
    if (error)
    {
      console.log('error fetching users');
      return callback(error);
    }

    _(results).each(function(facebooks_account)
    {
      App.db.update('facebook_accounts', facebooks_account._id, facebooks_account, function(error, facebook_account)
      {
        App.db.remove('facebooks_accounts', facebooks_account._id);
        App.db.remove('facebooks_accounts');
      });
    });

    callback(null, 'done');
  });
}