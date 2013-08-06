//
//  AdministratorAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var AdministratorAdmin = module.exports;

var App = require('app').app,
    wf = require('app-server/common/Workflow');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find an admin.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.find = function(request, response, next)
{
  // Defaults
  request.query.search = request.query.search ? request.query.search : '';
  request.query.limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;
  request.query.page = request.query.page ? parseInt(request.query.page, 10) : 1;
  request.query.sort = request.query.sort ? request.query.sort : '_id';

  // Filters
  var filters = {};
  if (request.query.search)
    filters.search = new RegExp('^.*?'+ request.query.search +'.*$', 'i');

  // Get results
  request.app.db.models.Admin.pagedFind(
  {
    filters: filters,
    keys: 'name.full',
    limit: request.query.limit,
    page: request.query.page,
    sort: request.query.sort
  }, function(error, results)
  {
    if (error)
      return next(error);

    if (request.xhr)
    {
      response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      results.filters = request.query;
      response.send(results);
    }
    else
    {
      results.filters = request.query;
      response.render('admin/administrators/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.read = function(request, response, next)
{
  var outcome = {};

  function getAdminGroups(callback)
  {
    request.app.db.models.AdminGroup.find({}, 'name').sort('name').exec(function(error, adminGroups)
    {
      if (error)
        return callback(error, null);

      outcome.adminGroups = adminGroups;
      return callback(null, 'done');
    });
  }

  function getRecord(callback)
  {
    request.app.db.models.Admin.findById(request.params.id).populate('groups', 'name').exec(function(error, record)
    {
      if (error)
        return callback(error, null);

      outcome.record = record;
      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

    if (request.xhr)
      response.send(outcome.record);
    else
    {
      response.render('admin/administrators/details',
      {
        data:
        {
          record: JSON.stringify(outcome.record),
          adminGroups: outcome.adminGroups
        }
      });
    }
  }

  require('async').parallel([getAdminGroups, getRecord], asyncFinally);
};

/*******************************************************************************
 * create
 *******************************************************************************
 * Create an admin.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.create = function(request, response, next)
{
  function validate()
  {
    if (!request.body['name.full'])
    {
      workflow.outcome.errors.push('Please enter a name.');
      return workflow.emit('response');
    }

    workflow.emit('createAdministrator');
  }

  function createAdministrator()
  {
    var nameParts = request.body['name.full'].trim().split(/\s/);

    var fieldsToSet =
    {
      name:
      {
        first: nameParts.shift(),
        middle: (nameParts.length > 1 ? nameParts.shift() : ''),
        last: (nameParts.length === 0 ? '' : nameParts.join(' '))
      }
    };

    fieldsToSet.name.full = fieldsToSet.name.first + (fieldsToSet.name.last ? ' ' + fieldsToSet.name.last : '');
    fieldsToSet.search = [
      fieldsToSet.name.first,
      fieldsToSet.name.middle,
      fieldsToSet.name.last
    ];

    request.app.db.models.Admin.create(fieldsToSet, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = admin;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('createAdministrator', createAdministrator);
  workflow.emit('validate');
};

/*******************************************************************************
 * update
 *******************************************************************************
 * Update an admin.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.update = function(request, response, next)
{
  function validate()
  {
    if (!request.body.first)
      workflow.outcome.errfor.first = 'required';

    if (!request.body.last)
      workflow.outcome.errfor.last = 'required';

    // Return if we have errors already.
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('patchAdministrator');
  }

  function patchAdministrator()
  {
    var fieldsToSet =
    {
      name:
      {
        first: request.body.first,
        middle: request.body.middle,
        last: request.body.last,
        full: request.body.first + ' ' + request.body.last
      },
      search: [
        request.body.first,
        request.body.middle,
        request.body.last
      ]
    };

    request.app.db.models.Admin.findByIdAndUpdate(request.params.id, fieldsToSet, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      admin.populate('groups', 'name', function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.admin = admin;
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdministrator', patchAdministrator);
  workflow.emit('validate');
};

/*******************************************************************************
 * groups
 *******************************************************************************
 * Update admin group membership.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.groups = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not change the group memberships of admins.');
      return workflow.emit('response');
    }

    if (!request.body.groups)
    {
      workflow.outcome.errfor.groups = 'required';
      return workflow.emit('response');
    }

    workflow.emit('patchAdministrator');
  }

  function patchAdministrator()
  {
    var fieldsToSet = { groups: request.body.groups };

    request.app.db.models.Admin.findByIdAndUpdate(request.params.id, fieldsToSet, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      admin.populate('groups', 'name', function(err, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.admin = admin;
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdministrator', patchAdministrator);
  workflow.emit('validate');
};

/*******************************************************************************
 * updatePermissions
 *******************************************************************************
 * Update permissions for an admin.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.updatePermissions = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not change the permissions of admins.');
      return workflow.emit('response');
    }

    if (!request.body.permissions)
    {
      workflow.outcome.errfor.permissions = 'required';
      return workflow.emit('response');
    }

    workflow.emit('patchAdministrator');
  }

  function patchAdministrator()
  {
    var fieldsToSet = { permissions: request.body.permissions };

    request.app.db.models.Admin.findByIdAndUpdate(request.params.id, fieldsToSet, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      admin.populate('groups', 'name', function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.admin = admin;
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdministrator', patchAdministrator);
  workflow.emit('validate');
};

/*******************************************************************************
 * linkUser
 *******************************************************************************
 * Link a user to an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.linkUser = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not link admins to users.');
      return workflow.emit('response');
    }

    if (!request.body.newUsername)
    {
      workflow.outcome.errfor.newUsername = 'required';
      return workflow.emit('response');
    }

    workflow.emit('verifyUser');
  }

  function verifyUser()
  {
    request.app.db.models.User.findOne({ username: request.body.newUsername }, 'username').exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User not found.');
        return workflow.emit('response');
      }
      else if (user.roles && user.roles.admin && user.roles.admin != request.params.id)
      {
        workflow.outcome.errors.push('User is already linked to a different admin.');
        return workflow.emit('response');
      }

      workflow.user = user;
      workflow.emit('duplicateLinkCheck');
    });
  }

  function duplicateLinkCheck()
  {
    request.app.db.models.Admin.findOne( { 'user.id': workflow.user._id, _id: { $ne: request.params.id } }).exec(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (admin)
      {
        workflow.outcome.errors.push('Another admin is already linked to that user.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    request.app.db.models.User.findByIdAndUpdate(workflow.user._id, {'roles.admin': request.params.id }).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('patchAdministrator');
    });
  }

  function patchAdministrator()
  {
    request.app.db.models.Admin.findByIdAndUpdate(request.params.id, { user: { id: workflow.user._id, name: workflow.user.username } }).exec(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      admin.populate('groups', 'name', function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.admin = admin;
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('verifyUser', verifyUser);
  workflow.on('duplicateLinkCheck', duplicateLinkCheck);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAdministrator', patchAdministrator);
  workflow.emit('validate');
};

/*******************************************************************************
 * unlinkUser
 *******************************************************************************
 * Unlink a user from an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.unlinkUser = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not unlink users from admins.');
      return workflow.emit('response');
    }

    if (request.user.roles.admin._id == request.params.id)
    {
      workflow.outcome.errors.push('You may not unlink yourself from admin.');
      return workflow.emit('response');
    }

    workflow.emit('patchAdministrator');
  }

  function patchAdministrator()
  {
    request.app.db.models.Admin.findById(request.params.id).exec(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Administrator was not found.');
        return workflow.emit('response');
      }

      var userId = admin.user.id;

      admin.user = {
        id: undefined,
        name: ''
      };

      admin.save(function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        admin.populate('groups', 'name', function(error, admin)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.admin = admin;
          workflow.emit('patchUser', userId);
        });
      });
    });
  }

  function patchUser(id)
  {
    request.app.db.models.User.findById(id).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      user.roles.admin = undefined;
      user.save(function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdministrator', patchAdministrator);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * deleteAdmin
 *******************************************************************************
 * Delete an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
AdministratorAdmin.deleteAdmin = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not delete admins.');
      return workflow.emit('response');
    }

    if (request.user.roles.admin._id == request.params.id)
    {
      workflow.outcome.errors.push('You may not delete your own admin record.');
      return workflow.emit('response');
    }

    workflow.emit('deleteAdministrator');
  }

  function deleteAdministrator()
  {
    request.app.db.models.Admin.findByIdAndRemove(request.params.id, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('deleteAdministrator', deleteAdministrator);
  workflow.emit('validate');
};