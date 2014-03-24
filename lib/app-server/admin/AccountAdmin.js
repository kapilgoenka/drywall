//
//  AccountAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var AccountAdmin = module.exports;

var _ = require('underscore'),
    async = require('async'),
    uuid = require('node-uuid'),
    wf = require('app-server/common/Workflow'),
    MediaCuration = require('lib/app-server/MediaCuration'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

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
    RiakDBAccessor.listDocumentsInBucket('accounts', function(error, matches)
    {
      if (error)
        return callback(error, null);

      outcome.results = matches || [];
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
      response.send(outcome.results);
    }
    else
    {
      response.render('admin/accounts/index', { data: { results: JSON.stringify(outcome.results) } });
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

  function getRecord(key, callback)
  {
    RiakDBAccessor.findOne(request.params.id, key, function(error, doc)
    {
      if (error)
        return callback(error, null);

      outcome.events = outcome.events || {};
      outcome.events[key] = doc || {};

      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

    outcome.user = { displayName: request.user.displayName };

    if (request.xhr)
      response.send(outcome);
    else
    {
      response.render('admin/accounts/details.handlebars',
      {
        data: { record: JSON.stringify(outcome, null, 4) },
        feet: "<script src='/views/admin/accounts/details.js'></script>",
        neck: "<link rel='stylesheet' href='/views/admin/accounts/details.css'>",
        title: 'Accounts / Details',
        layout: 'admin'
      });
    }
  }

  var getRecordFn = getRecord;
  var fetchFunctions = {};

  _(MediaCuration.keys).each(function(key)
  {
    fetchFunctions[key] = getRecordFn.bind(null, key);
  }, this);

  async.parallel(fetchFunctions, asyncFinally);
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
      _id: uuid.v4(),
      name:
      {
        first: nameParts.shift(),
        middle: (nameParts.length > 1 ? nameParts.shift() : ''),
        last: (nameParts.length === 0 ? '' : nameParts.join(' '))
      },
      createdBy:
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

    RiakDBAccessor.update('accounts', fieldsToSet._id, fieldsToSet, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = account;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response });
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

    RiakDBAccessor.findAndUpdate('accounts', { _id: request.params.id }, fieldsToSet, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response });
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
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not link accounts to users.');
        return workflow.emit('response');
      }

      if (!request.body.newUsername) {
        workflow.outcome.errfor.newUsername = 'required';
        return workflow.emit('response');
      }

      workflow.emit('verifyUser');
    });
  }

  function verifyUser()
  {
    RiakDBAccessor.findOne('users', { username: request.body.newUsername }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User not found.');
        return workflow.emit('response');
      }
      else if (user.accounts && user.accounts.account && user.accounts.account != request.params.id)
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
    RiakDBAccessor.findOne('accounts', { userId: workflow.user._id }, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (account && account._id !== request.params.id)
      {
        workflow.outcome.errors.push('Another account is already linked to that user.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    RiakDBAccessor.findAndUpdate('users', { _id: workflow.user._id }, { accounts: { account: request.params.id } }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('patchAccount');
    });
  }

  function patchAccount(callback)
  {
    RiakDBAccessor.findAndUpdate('accounts', { _id: request.params.id }, { user: { id: workflow.user._id, name: workflow.user.username } }, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response });
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
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not unlink users from accounts.');
        return workflow.emit('response');
      }

      workflow.emit('patchAccount');
    });
  }

  function patchAccount()
  {
    RiakDBAccessor.findOne('accounts', { _id: request.params.id }, function(error, account)
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

      RiakDBAccessor.update('accounts', account._id, account, function(error, account)
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
    RiakDBAccessor.findOne('users', { _id: id }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      user.accounts.account = undefined;

      RiakDBAccessor.update('users', user._id, user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response });
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
    RiakDBAccessor.findOne('admins', { _id: request.user.accounts.admin }, function(error, admin)
    {
      if (admin.groups && admin.groups.indexOf('root') === -1)
      {
        workflow.outcome.errors.push('You may not delete accounts.');
        return workflow.emit('response');
      }

      workflow.emit('deleteAccount');
    });
  }

  function deleteAccount()
  {
    RiakDBAccessor.remove('accounts', { _id: request.params.id}, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response });
  workflow.on('validate', validate);
  workflow.on('deleteAccount', deleteAccount);
  workflow.emit('validate');
};