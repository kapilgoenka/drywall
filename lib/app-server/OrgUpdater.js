var OrgUpdater = module.exports;
var App = require('app').app;
var async = require('async');
var _ = require('underscore');

OrgUpdater.updateUser = function(user, callback)
{
  App.db.update('users', user._id, user, function(error, user)
  {
    if (error)
      return callback(error);

    callback(null, user);
  });
};

OrgUpdater.updateOrgs = function(request, response)
{
  if (!request.body || !_(request.body).isObject())
    return response.send(400, 'Bad request.');

  App.db.fetchAllDocsInBucket('users', function(error, results)
  {
    if (error)
    {
      console.log('error fetching users');
      response.send(400, 'error fetching users');
    }

    var fetchFunctions = {};
    _(results).each(function(user, index)
    {
      if (user.social && user.social.facebook)
        user.organization = request.body[user.social.facebook];

      if (!user.organization)
        user.organization = 'FB Employees';

      fetchFunctions[user._id] = OrgUpdater.updateUser.bind(OrgUpdater, user);
    });

    if (_.size(fetchFunctions) > 0)
    {
      async.parallel(fetchFunctions, function(error, results)
      {
        if (error)
          return response.send(400, error);

        App.db.update('organizations', 'userMap', request.body, function(error, userMap)
        {
          if (error)
            return callback(error);

          response.send(200);
        });
      });
    }
    else
      response.send(200);
  });
};
