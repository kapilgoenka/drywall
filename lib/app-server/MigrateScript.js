var MigrateScript = module.exports;
var Config = require('app-server/config');
var App = require('app').app;
var _ = require('underscore');

var org_map = {
  '18907319': 'nbc',
  '924548': 'nbc',
  '6850260': 'nbc',
  '11826618': 'nbc',
  '503147631': 'nbc',
  '1497624624': 'ard',
  '1237113793': 'ard',
  '1187718601': 'ard',
  '4003516': 'ard',
  '34004908': 'foxsports',
  '745245550': 'foxdeports',
  '766417344': 'foxdeports',
  '658795614': 'foxdeports',
  '157146604310435': 'foxdeports',
  '1611767334': 'francetv',
  '591066255': 'francetv',
  '748085163': 'francetv',
  '514983474': 'francetv',
  '621172164': 'bbc',
  '644356995': 'bbc',
  '504668837': 'bbc',
  '508039987': 'bbc',
  '660550067': 'bbc',
  '667640505': 'bbc',
  '100002056611153': 'tv_globo',
  '100002055309020': 'tv_globo',
  '740796312': 'tv_globo',
  '748202949': 'array_interactive',
  '538453108': 'array_interactive',
  '1049998920': 'pulse_live',
  '652602439': 'espn',
  '733564271': 'espn',
  '1226880240': 'espn',
  '16309701': 'espn',
  '100000292974180': 'ria_novosti',
  '1329128877': 'ria_novosti',
  '100001489236098': 'glamurama',
  '743174333': 'glamurama',
  '100000329464479': 'glamurama',
  '598033851': 'glamurama',
  '1054763824': 'glamurama',
  '1210692907': 'glamurama',
  '1447299337': 'glamurama',
  '100000418162417': 'glamurama',
  '100000806298480': 'glamurama',
  '100001701963086': 'glamurama',
  '100002017182347': 'glamurama',
  '100000713005261': 'glamurama',
  '100000740027634': 'glamurama',
  '1279342932': 'zdf',
  '100000130950953': 'zdf',
  '1480226805': 'zdf',
  '542351325': 'test'
};

MigrateScript.initMigrate = function(callback)
{
  // App.db.fetchAllMediaCurationAccounts(function(error, mediaCurationAccounts)
  // {
  //   _(mediaCurationAccounts).each(function(account)
  //   {
  //     App.db.findOne(account, 'savedQueries', function(error, savedQueries)
  //     {
  //       _(savedQueries).each(function(value, key)
  //       {
  //         App.db.update(account, key, { savedQueries: value }, function(){});
  //       });
  //       App.db.remove(account, 'savedQueries', function(){});
  //     });
  //   });
  // });

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
      callback(null, 'done');

      // App.db.findAll('users', function(error, results)
      // {
      //   if (error)
      //   {
      //     console.log('error fetching users');
      //     return callback(error);
      //   }

      //   _(results).each(function(user)
      //   {
      //     if (user.social)
      //       user.organization = org_map[user.social.facebook] || 'facebook';
      //     else
      //      user.organization = 'facebook';

      //     App.db.update('users', user._id, user, function(error, user)
      //     {
      //       if (error)
      //       {
      //         console.log('error updating user');
      //         return callback(error);
      //       }
      //     });
      //   });
      //   callback(null, 'done');
      // });
    });
  });
}