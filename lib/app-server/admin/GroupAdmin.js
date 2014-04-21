//
//  GroupAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var GroupAdmin = module.exports;

var App = require('app').app,
    uid = require('node-uuid'),
    SSUtil = require('app-server/common/SSUtil'),
    wf = require('app-server/common/Workflow'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a group.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.find = function(request, response, next)
{
  //defaults
  // request.query.name = request.query.name ? request.query.name : '';
  // request.query.limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;
  // request.query.page = request.query.page ? parseInt(request.query.page, 10) : 1;
  // request.query.sort = request.query.sort ? request.query.sort : '_id';
  //
  // //filters
  // var filters = {};
  // if (request.query.name) filters.name = new RegExp('^.*?'+ request.query.name +'.*$', 'i');
  //
  // //get results
  // request.RiakDBAccessor.models.AdminGroup.pagedFind(
  // {
  //   filters: filters,
  //   keys: 'name',
  //   limit: request.query.limit,
  //   page: request.query.page,
  //   sort: request.query.sort
  // }, function(error, results)
  // {
  //   if (error)
  //     return next(error);
  //
  //   if (request.xhr)
  //   {
  //     response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  //     results.filters = request.query;
  //     response.send(results);
  //   }
  //   else
  //   {
  //     results.filters = request.query;
  //     response.render('admin/admin-groups/index', { data: { results: JSON.stringify(results) } });
  //   }
  // });

  RiakDBAccessor.listDocumentsInBucket('admin_groups', function(error, matches)
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
      // results.filters = request.query;
      response.render('admin/admin-groups/index', { data: { results: JSON.stringify(matches) } });
    }
  });
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch a group record.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.read = function(request, response, next)
{
  RiakDBAccessor.findOne('admin_groups', { _id: request.params.id }, function(error, adminGroup)
  {
    if (error)
      return next(error);

    if (request.xhr)
      response.send(adminGroup);
    else
    {
      response.render('admin/admin-groups/details',
      {
        data:
        {
          record: JSON.stringify(adminGroup)
        }
      });
    }
  });
};

/*******************************************************************************
 * create
 *******************************************************************************
 * Create a group.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.create = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin not found.');
        return workflow.emit('response');
      }

      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not create admin groups.');
        return workflow.emit('response');
      }

      if (!request.body.name)
      {
        workflow.outcome.errors.push('Please enter a name.');
        return workflow.emit('response');
      }

      workflow.emit('duplicateAdminGroupCheck');
    });
  }

  function duplicateAdminGroupCheck()
  {
    RiakDBAccessor.findOne('admin_groups', { _id: SSUtil.slugify(request.body.name) }, function(error, adminGroup)
    {
      if (error)
        return workflow.emit('exception', error);

      if (adminGroup)
      {
        workflow.outcome.errors.push('That group already exists.');
        return workflow.emit('response');
      }

      workflow.emit('createAdminGroup');
    });
  }

  function createAdminGroup()
  {
    var fieldsToSet =
    {
      _id: SSUtil.slugify(request.body.name),
      name: request.body.name,
      permissions: []
    };

    RiakDBAccessor.update('admin_groups', fieldsToSet._id, fieldsToSet, function(error, adminGroup)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = adminGroup;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('duplicateAdminGroupCheck', duplicateAdminGroupCheck);
  workflow.on('createAdminGroup', createAdminGroup);
  workflow.emit('validate');
};

/*******************************************************************************
 * update
 *******************************************************************************
 * Update a group.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.update = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin not found.');
        return workflow.emit('response');
      }

      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not update admin groups.');
        return workflow.emit('response');
      }

      if (!request.body.name)
      {
        workflow.outcome.errfor.name = 'required';
        return workflow.emit('response');
      }

      workflow.emit('patchAdminGroup');
    });
  }

  function patchAdminGroup()
  {
    var fieldsToSet =
    {
      name: request.body.name
    };

    RiakDBAccessor.findAndUpdate('admin_groups', { _id: request.params.id }, fieldsToSet, function(error, adminGroup)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.adminGroup = adminGroup;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdminGroup', patchAdminGroup);
  workflow.emit('validate');
};

/*******************************************************************************
 * updatePermissions
 *******************************************************************************
 * Update permissions for a group.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.updatePermissions = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin not found.');
        return workflow.emit('response');
      }

      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not change the permissions of admin groups.');
        return workflow.emit('response');
      }

      if (!request.body.permissions)
      {
        workflow.outcome.errfor.permissions = 'required';
        return workflow.emit('response');
      }

      workflow.emit('patchAdminGroup');
    });
  }

  function patchAdminGroup()
  {
    var fieldsToSet =
    {
      permissions: request.body.permissions
    };

    RiakDBAccessor.findAndUpdate('admin_groups', { _id: request.params.id }, fieldsToSet, function(error, adminGroup)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.adminGroup = adminGroup;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAdminGroup', patchAdminGroup);
  workflow.emit('validate');
};

/*******************************************************************************
 * deleteGroup
 *******************************************************************************
 * Delete a group.
 *
 * Inputs:
 *   request, response, next:
 */
GroupAdmin.deleteGroup = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin not found.');
        return workflow.emit('response');
      }

      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not delete admin groups.');
        return workflow.emit('response');
      }

      workflow.emit('deleteAdminGroup');
    });
  }

  function deleteAdminGroup()
  {
    RiakDBAccessor.remove('admin_groups', request.params.id, function(error)
    {
      if (error)
        return workflow.emit('exception', error);
      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('deleteAdminGroup', deleteAdminGroup);
  workflow.emit('validate');
};
