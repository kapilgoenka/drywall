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

    workflow.emit('patchUser');
  }

  function patchUser()
  {
    var fieldsToSet =
    {
      firstName: request.body.first,
      lastName: request.body.last
    };

    UserUpdater.patchUser(request.user, request, workflow, fieldsToSet);
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
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
    UserUpdater.updateUserDuplicateUsernameCheck(request.body.username, request.user._id, workflow, 'duplicateEmailCheck');
  }

  function duplicateEmailCheck()
  {
    UserUpdater.updateUserDuplicateEmailCheck(request.body.email, request.user._id, workflow, 'patchUser');
  }

  function patchUser()
  {
    var fieldsToSet =
    {
      username: request.body.username,
      email: request.body.email,
      search: [
        request.body.username,
        request.body.email
      ]
    };

    UserUpdater.patchUser(request.user._id, request, workflow, fieldsToSet);
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

    UserUpdater.patchUser(request.user._id, request, workflow, fieldsToSet);
  }

  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};

/*******************************************************************************
 * updateUserDuplicateUsernameCheck
 *******************************************************************************
 * See if the new username being requested by a current user is already in use.
 *
 * Inputs:
 *   newUsername, currentUserId, workflow, nextStep:
 */
UserUpdater.updateUserDuplicateUsernameCheck = function(newUsername, currentUserId, workflow, nextStep)
{
  App.db.find('users', { username: newUsername }, function(error, result)
  {
    if (error)
      return workflow.emit('exception', error);

    var isDuplicateUsername = false;

    _(result).each(function(user)
    {
      if (user._id !== currentUserId)
        isDuplicateUsername = true;
    });

    if (isDuplicateUsername)
    {
      workflow.outcome.errfor.username = 'username already taken';
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
}

/*******************************************************************************
 * updateUserDuplicateEmailCheck
 *******************************************************************************
 * See if the new email being requested by a current user is already in use.
 *
 * Inputs:
 *   newUsername, currentUserId, workflow, nextStep:
 */
UserUpdater.updateUserDuplicateEmailCheck = function(newEmail, currentUserId, workflow, nextStep)
{
  App.db.find('users', { email: newEmail }, function(error, result)
  {
    if (error)
      return workflow.emit('exception', error);

    var isDuplicateEmail = false;

    _(result).each(function(user)
    {
      if (user._id !== currentUserId)
        isDuplicateEmail = true;
    });

    if (isDuplicateEmail)
    {
      workflow.outcome.errfor.username = 'email already taken';
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
}

/*******************************************************************************
 * patchUser
 *******************************************************************************
 * Update Username and email for a user.
 *
 * Inputs:
 *   userId, request, workflow, additionalFieldsToSet:
 */
UserUpdater.patchUser = function(userId, request, workflow, fieldsToSet)
{
  App.db.findAndUpdate('users', userId, fieldsToSet, function(error, user)
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
};
