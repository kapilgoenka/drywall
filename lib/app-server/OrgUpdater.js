var OrgUpdater = module.exports;
var App = require('app').app;
var async = require('async');
var _ = require('underscore');
var wf = require('app-server/common/Workflow');

OrgUpdater.updateOrgs = function(request, response)
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
    App.db.forEach('users', '_id', function(user)
    {
      if (user.social && user.social.facebook)
        user.organization = request.body[user.social.facebook];

      if (!user.organization)
        user.organization = 'FB Employees';
    },
    function(error, results)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('saveOrgJson');
    });
  }

  function saveOrgJson()
  {
    App.db.update('organizations', 'userMap', request.body, function(error, userMap)
    {
      if (error)
        return response.send(400, error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('updateUsers', updateUsers);
  workflow.on('saveOrgJson', saveOrgJson);
  workflow.emit('validate');
};
