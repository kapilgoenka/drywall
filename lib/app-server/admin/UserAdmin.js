//
//  UserAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UserAdmin = module.exports;

var App = require('app').app,
    _ = require('underscore'),
    uuid = require('node-uuid'),
    async = require('async'),
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    UserUpdater = require('app-server/settings/UserUpdater'),
    UserDeleteProcessor = require('app-server/admin/UserDeleteProcessor'),
    SocialAccountConnector = require('app-server/settings/SocialAccountConnector'),
    AdminUtil = require('lib/app-server/db/AdminUtil'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.find = function(request, response, next)
{
  RiakDBAccessor.listDocumentsInBucket('users', function(error, results)
  {
    if (error)
      return next(error);

    if (request.xhr)
    {
      response.header("Cache-Control", "no-cache, no-store, must-revalidate");
      results.filters = request.query;
      return response.send(results);
    }
    else
    {
      results.filters = request.query;
      return response.render('admin/users/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch a user record.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.read = function(request, response, next)
{
  RiakDBAccessor.findOne('users', request.params.id, function(error, user)
  {
    if (error)
      return next(error);

    UserAdmin.populateUser(user, function(error, user)
    {
      if (error)
        return next(error);

      if (request.xhr)
        response.send(user);
      else
        response.render('admin/users/details', { data: { record: JSON.stringify(user) } });
    });
  });
};

UserAdmin.fetchAccount = function(accountName, accountId, callback)
{
  var bucket = (accountName === 'admin') ? 'admins' : (accountName + '_accounts');

  RiakDBAccessor.findOne(bucket, accountId, function(error, account)
  {
    if (error)
      return callback(error);

    return callback(null, account);
  });
};

UserAdmin.fetchAccounts = function(user, callback)
{
  var fetchAccountFn = this.fetchAccount;
  var fetchFunctions = {};

  _(user.accounts).each(function(accountId, accountName)
  {
    fetchFunctions[accountName] = fetchAccountFn.bind(this, accountName, accountId);
  }, this);

  if (_.size(fetchFunctions) > 0)
  {
    async.parallel(fetchFunctions, function(error, results)
    {
      if (error)
        return callback(error);

      return callback(null, results);
    } );
  }
  else
    return callback(null, {});
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch a user record.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.populateUser = function(user, callback)
{
  this.fetchAccounts(user, function(error, accounts)
  {
    if (error)
      return callback(error);

    user.accounts = accounts;
    user.accounts.media_curation = user.username + '--media_curation';

    // Fetch any social accounts.
    SocialAccountConnector.fetchSocialAccounts(user, function(error, socialAccounts)
    {
      if (error)
        return callback(error);

      user.socialAccounts = socialAccounts;
      return callback(null, user);
    });
  });
};

/*******************************************************************************
 * create
 *******************************************************************************
 * Create a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.create = function(request, response, next)
{
  function validate()
  {
    if (!request.body.username)
    {
      workflow.outcome.errors.push('Please enter a username.');
      return workflow.emit('response');
    }

    if (!SignupUtil.isValidUsernameFormat(request.body.username))
    {
      workflow.outcome.errors.push('only use letters, numbers, -, _');
      return workflow.emit('response');
    }

    workflow.emit('duplicateUsernameCheck');
  }

  function duplicateUsernameCheck()
  {
    RiakDBAccessor.findOne('users', { username: request.body.username }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (user)
      {
        workflow.outcome.errors.push('That username is already taken.');
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  }

  function createUser()
  {
    var baseParams = { username: request.body.username };

    SignupUtil.createUser({ baseParams: baseParams, additionalParams: {} }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = user;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Create User' });
  workflow.on('validate', validate);
  workflow.on('duplicateUsernameCheck', duplicateUsernameCheck);
  workflow.on('createUser', createUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * update
 *******************************************************************************
 * Update a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.update = function(request, response, next)
{
  function validate()
  {
    // Defaults
    if (!request.body.isActive)
      request.body.isActive = 'no';

    // Verify
    if (!request.body.username)
      workflow.outcome.errfor.username = 'required';
    else if (!SignupUtil.isValidUsernameFormat(request.body.username))
      workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';

    if (!request.body.email)
      workflow.outcome.errfor.email = 'required';
    else if (!SignupUtil.isValidEmailFormat(request.body.email))
      workflow.outcome.errfor.email = 'invalid email format';

    // Return if we have errors already.
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('duplicateUsernameCheck');
  }

  function duplicateUsernameCheck()
  {
    UserUpdater.updateUserDuplicateUsernameCheck(request.body.username, request.params.id, workflow, 'duplicateEmailCheck');
  }

  function duplicateEmailCheck()
  {
    UserUpdater.updateUserDuplicateEmailCheck(request.body.email, request.params.id, workflow, 'patchUser');
  }

  function patchUser()
  {
    UserUpdater.patchUser(request.params.id, request, workflow, { username: request.body.username, email: request.body.email });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update User' });
  workflow.on('validate', validate);
  workflow.on('duplicateUsernameCheck', duplicateUsernameCheck);
  workflow.on('duplicateEmailCheck', duplicateEmailCheck);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * updatePassword
 *******************************************************************************
 * Update a user password.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.updatePassword = function(request, response, next)
{
  function validate()
  {
    if (!request.body.newPassword)
      workflow.outcome.errfor.newPassword = 'required';

    if (!request.body.confirm)
      workflow.outcome.errfor.confirm = 'required';

    if (request.body.newPassword != request.body.confirm)
      workflow.outcome.errors.push('Passwords do not match.');

    // Return if we have errors already.
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    var fieldsToSet =
    {
      password: App.encryptPassword(request.body.newPassword)
    };

    RiakDBAccessor.findAndUpdate('users', request.params.id, fieldsToSet, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      UserAdmin.populateUser(user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.outcome.user = user;
        workflow.outcome.newPassword = '';
        workflow.outcome.confirm = '';
        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update Password for: ' + request.params.id });
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * linkAdmin
 *******************************************************************************
 * Link an admin to a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.linkAdmin = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', request.user.accounts.admin, function(error, admin)
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
        workflow.outcome.errors.push('You may not link users to admins.');
        return workflow.emit('response');
      }

      workflow.emit('makeAdmin');
    });
  }

  function makeAdmin()
  {
    RiakDBAccessor.findOne('users', request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      AdminUtil.makeAdmin(user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        UserAdmin.populateUser(user, function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.user = user;
          workflow.emit('response');
        });
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Make Admin' });
  workflow.on('validate', validate);
  workflow.on('makeAdmin', makeAdmin);
  workflow.emit('validate');
};

/*******************************************************************************
 * unlinkAdmin
 *******************************************************************************
 * Unlink an admin from a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.unlinkAdmin = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', request.user.accounts.admin, function(error, admin)
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
        workflow.outcome.errors.push('You may not unlink users from admins.');
        return workflow.emit('response');
      }

      if (request.user._id === request.params.id)
      {
        workflow.outcome.errors.push('You may not unlink yourself from admin.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    RiakDBAccessor.findOne('users', request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      var adminId = user.accounts.admin;
      delete user.accounts.admin;

      RiakDBAccessor.update('users', user._id, user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        UserAdmin.populateUser(user, function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.user = user;
          workflow.emit('patchAdmin', adminId);
        });
      });
    });
  }

  function patchAdmin(id)
  {
    RiakDBAccessor.findOne('admins', id, function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin was not found.');
        return workflow.emit('response');
      }

      delete admin.user;

      RiakDBAccessor.update('admins', admin._id, admin, function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Remove admin privilege' });
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAdmin', patchAdmin);
  workflow.emit('validate');
};

/*******************************************************************************
 * linkAccount
 *******************************************************************************
 * Link an account to a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.linkAccount = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', request.user.accounts.admin, function(error, admin)
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
        workflow.outcome.errors.push('You may not link users to accounts.');
        return workflow.emit('response');
      }

      if (!request.body.newAccountId)
      {
        workflow.outcome.errfor.newAccountId = 'required';
        return workflow.emit('response');
      }

      workflow.emit('verifyAccount');
    });
  }

  function verifyAccount()
  {
    RiakDBAccessor.findOne('accounts', request.body.newAccountId, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!account)
      {
        workflow.outcome.errors.push('Account not found.');
        return workflow.emit('response');
      }

      if (account.user && account.user._id && account.user._id != request.params.id)
      {
        workflow.outcome.errors.push('Account is already linked to a different user.');
        return workflow.emit('response');
      }

      workflow.account = account;
      workflow.emit('duplicateLinkCheck');
    });
  }

  function duplicateLinkCheck()
  {
    RiakDBAccessor.findOne('users', { 'accounts.account': request.body.newAccountId }, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (user && user._id !== request.params.id)
      {
        workflow.outcome.errors.push('Another user is already linked to that account.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    RiakDBAccessor.findOne('users', request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      //TODO
      user.accounts.account = request.body.newAccountId;

      RiakDBAccessor.update('users', user._id, user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        UserAdmin.populateUser(user, function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.user = user;
          workflow.emit('patchAccount');
        });
      });
    });
  }

  function patchAccount()
  {
    workflow.account.user = { id: request.params.id };

    RiakDBAccessor.update('accounts', workflow.account._id, workflow.account, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Link Account' });
  workflow.on('validate', validate);
  workflow.on('verifyAccount', verifyAccount);
  workflow.on('duplicateLinkCheck', duplicateLinkCheck);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAccount', patchAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * unlinkAccount
 *******************************************************************************
 * Unlink an account from a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.unlinkAccount = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', request.user.accounts.admin, function(error, admin)
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
        workflow.outcome.errors.push('You may not unlink users from accounts.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    RiakDBAccessor.findOne('users', request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      var accountId = user.accounts.account;

      //TODO
      delete user.accounts.account;

      RiakDBAccessor.update('users', user._id, user, function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        UserAdmin.populateUser(user, function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.user = user;
          workflow.emit('patchAccount', accountId);
        });
      });
    });
  }

  function patchAccount(id)
  {
    RiakDBAccessor.findOne('accounts', id, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!account)
      {
        workflow.outcome.errors.push('Account was not found.');
        return workflow.emit('response');
      }

      delete account.user;

      RiakDBAccessor.update('accounts', account._id, account, function(error, account)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Unlink Account' });
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAccount', patchAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * disconnectSocial
 *******************************************************************************
 * Disconnect a social account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.disconnectSocial = function(request, response, next)
{
  function validate()
  {
    RiakDBAccessor.findOne('admins', request.user.accounts.admin, function(error, admin)
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
        workflow.outcome.errors.push('You may not disconnect users from social accounts.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    RiakDBAccessor.findOne('users', request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      SocialAccountConnector.removeSocialAccount(user, request.params.socialType, function(error)
      {
        if (error)
          return workflow.emit('exception', error);

        delete user.social[socialType];

        RiakDBAccessor.update('users', user._id, user, function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          UserAdmin.populateUser(user, function(error, user)
          {
            if (error)
              return workflow.emit('exception', error);

            workflow.outcome.user = user;
            workflow.emit('response');
          });
        });
      } );
    } );
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Disconnect Social' });
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * deleteUser
 *******************************************************************************
 * Delete a user.
 *
 * Inputs:
 *   request, response, next:
 */
UserAdmin.deleteUser = function(request, response, next)
{
  UserDeleteProcessor.execute(request, response, next);
};
