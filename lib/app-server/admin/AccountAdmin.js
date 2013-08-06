//
//  AccountAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var AccountAdmin = module.exports;

var App = require('app').app,
    async = require('async'),
    wf = require('app-server/common/Workflow');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find an account.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.find = function(request, response, next)
{
  var outcome = {};

  function getResults(callback)
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

    // Get results.
    request.app.db.models.Account.pagedFind(
    {
      filters: filters,
      keys: 'name company phone zip userCreated',
      limit: request.query.limit,
      page: request.query.page,
      sort: request.query.sort
    }, function(error, results)
    {
      if (error)
        return callback(error, null);

      outcome.results = results;
      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

    if (request.xhr)
    {
      response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      outcome.results.filters = request.query;
      response.send(outcome.results);
    }
    else
    {
      outcome.results.filters = request.query;
      response.render('admin/accounts/index',
      {
        data:
        {
          results: JSON.stringify(outcome.results)
        }
      });
    }
  }

  async.parallel([getResults], asyncFinally);
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch an account record.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.read = function(request, response, next)
{
  var outcome = {};

  function getRecord(callback)
  {
    request.app.db.models.Account.findById(request.params.id).exec(function(error, record)
    {
      if (error) return callback(error, null);

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
      response.render('admin/accounts/details',
      {
        data:
        {
          record: JSON.stringify(outcome.record)
        }
      });
    }
  }

  async.parallel([getRecord], asyncFinally);
};

/*******************************************************************************
 * create
 *******************************************************************************
 * Create an account.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.create = function(request, response, next)
{
  function validate()
  {
    if (!request.body['name.full'])
    {
      workflow.outcome.errors.push('Please enter a name.');
      return workflow.emit('response');
    }

    workflow.emit('createAccount');
  }

  function createAccount()
  {
    var nameParts = request.body['name.full'].trim().split(/\s/);
    var fieldsToSet =
    {
      name:
      {
        first: nameParts.shift(),
        middle: (nameParts.length > 1 ? nameParts.shift() : ''),
        last: (nameParts.length === 0 ? '' : nameParts.join(' '))
      },
      userCreated:
      {
        id: request.user._id,
        name: request.user.username,
        time: new Date().toISOString()
      }
    };

    fieldsToSet.name.full = fieldsToSet.name.first + (fieldsToSet.name.last ? ' '+ fieldsToSet.name.last : '');
    fieldsToSet.search = [
      fieldsToSet.name.first,
      fieldsToSet.name.middle,
      fieldsToSet.name.last
    ];

    request.app.db.models.Account.create(fieldsToSet, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = account;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('createAccount', createAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * update
 *******************************************************************************
 * Update an account.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.update = function(request, response, next)
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

    workflow.emit('patchAccount');
  }

  function patchAccount()
  {
    var fieldsToSet =
    {
      name:
      {
        first: request.body.first,
        middle: request.body.middle,
        last: request.body.last,
        full: request.body.first +' '+ request.body.last
      },
      company: request.body.company,
      phone: request.body.phone,
      zip: request.body.zip,
      search: [
        request.body.first,
        request.body.middle,
        request.body.last,
        request.body.company,
        request.body.phone,
        request.body.zip
      ]
    };

    request.app.db.models.Account.findByIdAndUpdate(request.params.id, fieldsToSet, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAccount', patchAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * linkUser
 *******************************************************************************
 * Link a user to an account record.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.linkUser = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not link accounts to users.');
      return workflow.emit('response');
    }

    if (!request.body.newUsername) {
      workflow.outcome.errfor.newUsername = 'required';
      return workflow.emit('response');
    }

    workflow.emit('verifyUser');
  }

  function verifyUser()
  {
    request.app.db.models.User.findOne({ username: request.body.newUsername }).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User not found.');
        return workflow.emit('response');
      }
      else if (user.roles && user.roles.account && user.roles.account != request.params.id)
      {
        workflow.outcome.errors.push('User is already linked to a different account.');
        return workflow.emit('response');
      }

      workflow.user = user;
      workflow.emit('duplicateLinkCheck');
    });
  }

  function duplicateLinkCheck(callback)
  {
    request.app.db.models.Account.findOne({ 'user.id': workflow.user._id, _id: {$ne: request.params.id} }).exec(function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (account)
      {
        workflow.outcome.errors.push('Another account is already linked to that user.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    request.app.db.models.User.findByIdAndUpdate(workflow.user._id, { 'roles.account': request.params.id }).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('patchAccount');
    });
  }

  function patchAccount(callback)
  {
    request.app.db.models.Account.findByIdAndUpdate(request.params.id, { user: { id: workflow.user._id, name: workflow.user.username } }).exec(function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('verifyUser', verifyUser);
  workflow.on('duplicateLinkCheck', duplicateLinkCheck);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAccount', patchAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * unlinkUser
 *******************************************************************************
 * Unlink a user from an account record.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.unlinkUser = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not unlink users from accounts.');
      return workflow.emit('response');
    }

    workflow.emit('patchAccount');
  }

  function patchAccount()
  {
    request.app.db.models.Account.findById(request.params.id).exec(function(error, account)
    {
      if (error)
       return workflow.emit('exception', error);

      if (!account)
      {
        workflow.outcome.errors.push('Account was not found.');
        return workflow.emit('response');
      }

      var userId = account.user.id;
      account.user = { id: undefined, name: '' };
      account.save(function(error, account)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.account = account;
        workflow.emit('patchUser', userId);
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

      user.roles.account = undefined;
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
  workflow.on('patchAccount', patchAccount);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * deleteAccount
 *******************************************************************************
 * Delete an account.
 *
 * Inputs:
 *   request, response, next:
 */
AccountAdmin.deleteAccount = function(request, response, next)
{
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not delete accounts.');
      return workflow.emit('response');
    }

    workflow.emit('deleteAccount');
  }

  function deleteAccount()
  {
    request.app.db.models.Account.findByIdAndRemove(request.params.id, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('deleteAccount', deleteAccount);
  workflow.emit('validate');
};