//
//  UserUpdater.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UserUpdater = module.exports;

var App = require('app').app,
    _ = require('underscore'),
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    UpdateUserUtil = require('app-server/UpdateUserUtil'),
    UserAdmin = require('app-server/admin/UserAdmin');

/*******************************************************************************
 * updateContactInfo
 *******************************************************************************
 * Update Contact Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
UserUpdater.updateContactInfo = function(request, response, next)
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
      firstName: request.body.first,
      lastName: request.body.last
    };

    _.extend(request.user, fieldsToSet);

    App.db.update('users', request.user._id, request.user, function(error, user)
    {
      if (error)
        return workflow.emit('exception', error);

      return workflow.emit('response');
    });
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchAccount', patchAccount);
  workflow.emit('validate');
};

/*******************************************************************************
 * updateIdentity
 *******************************************************************************
 * Update Identity Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
UserUpdater.updateIdentity = function(request, response, next)
{
  function validate()
  {
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
    UpdateUserUtil.updateUserDuplicateUsernameCheck(request.body.username, request.user._id, request, workflow, 'duplicateEmailCheck');
  }

  function duplicateEmailCheck()
  {
    UpdateUserUtil.updateUserDuplicateEmailCheck(request.body.email, request.user._id, request, workflow, 'patchUser');
  }

  function patchUser()
  {
    UpdateUserUtil.patchUser(request.user, request, workflow);
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
 * Update password for an account.
 *
 * Inputs:
 *   request, response, next:
 */
UserUpdater.updatePassword = function(request, response, next)
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

    _.extend(request.user, fieldsToSet);

    App.db.update('users', request.user._id, request.user, function(error, user)
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

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};
