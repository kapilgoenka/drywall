//
//  UserAdmin.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UserAdmin = module.exports;

var App = require('app').app,
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    AccountUtil = require('app-server/AccountUtil');

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
  // Defaults
  request.query.username = request.query.username ? request.query.username : '';
  request.query.limit = request.query.limit ? parseInt(request.query.limit, 10) : 20;
  request.query.page = request.query.page ? parseInt(request.query.page, 10) : 1;
  request.query.sort = request.query.sort ? request.query.sort : '_id';

  // Filters
  var filters = {};

  if (request.query.username)
    filters.username = new RegExp('^.*?'+ request.query.username +'.*$', 'i');

  if (request.query.isActive)
    filters.isActive = request.query.isActive;

  if (request.query.roles && request.query.roles == 'admin')
  {
    filters['roles.admin'] = { $exists: true };
  }

  if (request.query.roles && request.query.roles == 'account')
  {
    filters['roles.account'] = { $exists: true };
  }

  // Get results.
  request.app.db.models.User.pagedFind(
  {
    filters: filters,
    keys: 'username email isActive',
    limit: request.query.limit,
    page: request.query.page,
    sort: request.query.sort
  }, function(error, results)
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
  } );
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
  request.app.db.models.User.findById(request.params.id).populate('roles.admin', 'name.full').populate('roles.account', 'name.full').exec(function(error, user)
  {
    if (error)
      return next(error);

    if (request.xhr)
      response.send(user);
    else
      response.render('admin/users/details', { data: { record: JSON.stringify(user) } });
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
    request.app.db.models.User.findOne({ username: request.body.username }, function(error, user)
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
    var fieldsToSet =
    {
      username: request.body.username,
      search: [
        request.body.username
      ]
    };

    request.app.db.models.User.create(fieldsToSet, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.record = user;
      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
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
    AccountUtil.updateUserDuplicateUsernameCheck(request.body.username, request.params.id, request, workflow, 'duplicateEmailCheck');
  }

  function duplicateEmailCheck()
  {
    AccountUtil.updateUserDuplicateEmailCheck(request.body.email, request.params.id, request, workflow, 'patchUser');
  }

  function patchUser()
  {
    AccountUtil.patchUser(request.params.id, request, workflow, { isActive: request.body.isActive });
  }

  var workflow = new wf.Workflow(request, response);
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
      password: request.app.db.models.User.encryptPassword(request.body.newPassword)
    };

    request.app.db.models.User.findByIdAndUpdate(request.params.id, fieldsToSet, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      user.populate('roles.admin roles.account', 'name.full', function(error, user)
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

  var workflow = new wf.Workflow(request, response);
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
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not link users to admins.');
      return workflow.emit('response');
    }

    if (!request.body.newAdminId)
    {
      workflow.outcome.errfor.newAdminId = 'required';
      return workflow.emit('response');
    }

    workflow.emit('verifyAdmin');
  }

  function verifyAdmin()
  {
    request.app.db.models.Admin.findById(request.body.newAdminId).exec(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin not found.');
        return workflow.emit('response');
      }

      if (admin.user.id && admin.user.id != request.params.id)
      {
        workflow.outcome.errors.push('Admin is already linked to a different user.');
        return workflow.emit('response');
      }

      workflow.admin = admin;
      workflow.emit('duplicateLinkCheck');
    });
  }

  function duplicateLinkCheck()
  {
    request.app.db.models.User.findOne({ 'roles.admin': request.body.newAdminId, _id: {$ne: request.params.id} }).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (user)
      {
        workflow.outcome.errors.push('Another user is already linked to that admin.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    request.app.db.models.User.findById(request.params.id).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      user.roles.admin = request.body.newAdminId;
      user.save(function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        user.populate('roles.admin roles.account', 'name.full', function(error, user)
        {
          if (error)
            return workflow.emit('exception', error);

          workflow.outcome.user = user;
          workflow.emit('patchAdmin');
        });
      });
    });
  }

  function patchAdmin()
  {
    workflow.admin.user = { id: request.params.id, name: workflow.outcome.user.username };
    workflow.admin.save(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('verifyAdmin', verifyAdmin);
  workflow.on('duplicateLinkCheck', duplicateLinkCheck);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAdmin', patchAdmin);
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
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not unlink users from admins.');
      return workflow.emit('response');
    }

    if (request.user._id == request.params.id)
    {
      workflow.outcome.errors.push('You may not unlink yourself from admin.');
      return workflow.emit('response');
    }

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    request.app.db.models.User.findById(request.params.id).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      var adminId = user.roles.admin;
      user.roles.admin = null;
      user.save(function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        user.populate('roles.admin roles.account', 'name.full', function(error, user)
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
    request.app.db.models.Admin.findById(id).exec(function(error, admin)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!admin)
      {
        workflow.outcome.errors.push('Admin was not found.');
        return workflow.emit('response');
      }

      admin.user = undefined;
      admin.save(function(error, admin)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
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
    if (!request.user.roles.admin.isMemberOf('root'))
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
  }

  function verifyAccount()
  {
    request.app.db.models.Account.findById(request.body.newAccountId).exec(function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!account)
      {
        workflow.outcome.errors.push('Account not found.');
        return workflow.emit('response');
      }

      if (account.user.id && account.user.id != request.params.id)
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
    request.app.db.models.User.findOne({ 'roles.account': request.body.newAccountId, _id: {$ne: request.params.id} }).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (user)
      {
        workflow.outcome.errors.push('Another user is already linked to that account.');
        return workflow.emit('response');
      }

      workflow.emit('patchUser');
    });
  }

  function patchUser()
  {
    request.app.db.models.User.findById(request.params.id).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      user.roles.account = request.body.newAccountId;
      user.save(function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        user.populate('roles.admin roles.account', 'name.full', function(error, user)
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
    workflow.account.user = { id: request.params.id, name: workflow.outcome.user.username };
    workflow.account.save(function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
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
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not unlink users from accounts.');
      return workflow.emit('response');
    }

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    request.app.db.models.User.findById(request.params.id).exec(function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!user)
      {
        workflow.outcome.errors.push('User was not found.');
        return workflow.emit('response');
      }

      var accountId = user.roles.account;
      user.roles.account = null;
      user.save(function(error, user)
      {
        if (error)
          return workflow.emit('exception', error);

        user.populate('roles.admin roles.account', 'name.full', function(error, user)
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
    request.app.db.models.Account.findById(id).exec(function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      if (!account)
      {
        workflow.outcome.errors.push('Account was not found.');
        return workflow.emit('response');
      }

      account.user = undefined;
      account.save(function(error, account)
      {
        if (error)
          return workflow.emit('exception', error);

        workflow.emit('response');
      });
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.on('patchAccount', patchAccount);
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
  function validate()
  {
    if (!request.user.roles.admin.isMemberOf('root'))
    {
      workflow.outcome.errors.push('You may not delete users.');
      return workflow.emit('response');
    }

    if (request.user._id == request.params.id)
    {
      workflow.outcome.errors.push('You may not delete yourself from user.');
      return workflow.emit('response');
    }

    workflow.emit('deleteUser');
  }

  function deleteUser(error)
  {
    request.app.db.models.User.findByIdAndRemove(request.params.id, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('deleteUser', deleteUser);
  workflow.emit('validate');
};
