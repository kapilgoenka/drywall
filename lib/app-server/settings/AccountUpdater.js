//
//  AccountUpdater.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var AccountUpdater = module.exports;

var App = require('app').app,
    SignupUtil = require('app-server/signup/SignupUtil'),
    AccountUtil = require('app-server/AccountUtil'),
    _ = require('underscore');

/*******************************************************************************
 * updateContactInfo
 *******************************************************************************
 * Update Contact Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
AccountUpdater.updateContactInfo = function(request, response, next)
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

    request.app.db.models.Account.findByIdAndUpdate(request.user.roles.account.id, fieldsToSet, function(error, account)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.outcome.account = account;
      return workflow.emit('response');
    });
  }

  var workflow = new App.utility.Workflow(request, response);
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
AccountUpdater.updateIdentity = function(request, response, next)
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
    AccountUtil.updateUserDuplicateUsernameCheck(request.body.username, request.user.id, request, workflow, 'duplicateEmailCheck');
  }

  function duplicateEmailCheck()
  {
    AccountUtil.updateUserDuplicateEmailCheck(request.body.email, request.user.id, request, workflow, 'patchUser');
  }

  function patchUser()
  {
    AccountUtil.patchUser(request.user.id, request, workflow);
  }

  var workflow = new App.utility.Workflow(request, response);
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
AccountUpdater.updatePassword = function(request, response, next)
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

    request.app.db.models.User.findByIdAndUpdate(request.user.id, fieldsToSet, function(error, user)
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

  var workflow = new App.utility.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('patchUser', patchUser);
  workflow.emit('validate');
};
