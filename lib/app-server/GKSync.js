var GKSync = module.exports;
var _ = require('underscore');
var wf = require('app-server/common/Workflow');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

GKSync.getUserMapping = function(request, response)
{
  RiakDBAccessor.findOne('organizations', 'userMap', function(error, userMap)
  {
    if (error)
      return response.send(400, error);

    response.send(userMap);
  });
};

GKSync.updateUserMapping = function(request, response)
{
  function validate()
  {
    if (!request.body || !_(request.body).isObject() || _(request.body).keys().length < 10) // we know there are at least 10 orgs, so this prevents againts an erroneous input
      workflow.outcome.errfor.body = 'Bad request';

    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('updateUsers');
  }

  function updateUsers()
  {
    RiakDBAccessor.forEach('users', '_id', function(user)
    {
      if (user.social && user.social.facebook)
        user.organization = request.body[user.social.facebook];

      if (!user.organization)
        user.organization = 'FB Employees';

      user.organization = user.organization.replace(' ', '_');
    },
    function(error, results)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('saveJSON');
    });
  }

  function saveJSON()
  {
    RiakDBAccessor.update('organizations', 'userMap', request.body, function(error, userMap)
    {
      if (error)
        return response.send(400, error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update Orgs' });
  workflow.on('validate', validate);
  workflow.on('updateUsers', updateUsers);
  workflow.on('saveJSON', saveJSON);
  workflow.emit('validate');
};
