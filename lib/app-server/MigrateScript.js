var MigrateScript = module.exports;
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

MigrateScript.insertEventMetadata = function(callback)
{
  RiakDBAccessor.findOne('events', 'MetaData', function(error, metaData)
  {
    if (error)
      return callback(error);

    if (metaData)
      return callback(null, metaData);

    metaData = {
      'sochi--event': {
        displayName: 'Sochi 2014'
      },
      'lakme2014--event': {
        displayName: 'Lakme 2014'
      },
      'superbowl48--event': {
        displayName: 'Super Bowl 48'
      },
      'nbaallstar2014--event': {
        displayName: 'NBA All Star 2014'
      },
      'oscars2014--event': {
        displayName: 'Oscars 2014'
      },
      'carnaval2014--event': {
        displayName: 'Carnaval 2014'
      }
    };

    RiakDBAccessor.update('events', 'MetaData', metaData, function(error, metaData)
    {
      return callback(error, metaData);
    });
  });
};

MigrateScript.updateUserDisplayNames = function(callback)
{
  RiakDBAccessor.forEach('users', '_id', function(user)
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
};
