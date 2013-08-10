//
//  UserDeleteProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UserDeleteProcessor = module.exports;

var App = require('app').app,
    async = require('async'),
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    AccountUtil = require('app-server/AccountUtil'),
    SocialAccountConnector = require('app-server/settings/SocialAccountConnector');

/*******************************************************************************
 * execute
 *******************************************************************************
 * Delete a user and all associated account records.
 *
 * Inputs:
 *   request, response, next:
 */
UserDeleteProcessor.execute = function(request, response, next)
{
  var workflow = new wf.Workflow(request, response);
  workflow.on('checkPermissions', checkPermissions);
  workflow.on('fetchUser', fetchUser);
  workflow.on('deleteLinkedAccounts', deleteLinkedAccounts);
  workflow.on('deleteUserAccount', deleteUserAccount);
  workflow.on('deleteUserSocialAccounts', deleteUserSocialAccounts);
  workflow.on('deleteUser', deleteUser);
  workflow.emit('checkPermissions', request, workflow);
};

/*******************************************************************************
 * checkPermissions
 *******************************************************************************
 * Check the logged in user has permissions to delete this user.
 *
 * Inputs:
 *   request, workflow:
 */
function checkPermissions(request, workflow)
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

  workflow.emit('fetchUser', request, workflow, request.params.id);
}

/*******************************************************************************
 * fetchUser
 *******************************************************************************
 * Fetch the record for the user being deleted.
 *
 * Inputs:
 *   request, workflow, userId:
 */
function fetchUser(request, workflow, userId)
{
  request.app.db.models.User.findById(userId, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (!user)
    {
      workflow.outcome.errors.push('User was not found.');
      return workflow.emit('response');
    }

    workflow.emit('deleteLinkedAccounts', request, workflow, user);
  } );
}

/*******************************************************************************
 * deleteLinkedAccounts
 *******************************************************************************
 * Delete the user account and social accounts linked to the user.
 *
 * Inputs:
 *   request, workflow, user:
 */
function deleteLinkedAccounts(request, workflow, user)
{
  if (user.roles.account)
    workflow.emit('deleteUserAccount', request, workflow, user);
  else
    workflow.emit('deleteUserSocialAccounts', request, workflow, user);
}

/*******************************************************************************
 * deleteUserAccount
 *******************************************************************************
 * Delete the user account.
 *
 * Inputs:
 *   request, workflow, user:
 */
function deleteUserAccount(request, workflow, user)
{
  request.app.db.models.Account.remove({ _id: user.roles.account }, function(error, numModified)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.emit('deleteUserSocialAccounts', request, workflow, user);
  } );
}

/*******************************************************************************
 * deleteUserSocialAccounts
 *******************************************************************************
 * Delete all social accounts for the user.
 *
 * Inputs:
 *   request, workflow, user:
 */
function deleteUserSocialAccounts(request, workflow, user)
{
  var socialAccountTypes = Object.keys(SocialAccountConnector.SCHEMA_MAP);
  var removeSocialAccountFn = SocialAccountConnector.removeSocialAccount;
  var deleteFunctions = [];

  socialAccountTypes.forEach(function(socialType)
  {
    var socialId = user.getSocialId(socialType);
    if (socialId)
      deleteFunctions.push(removeSocialAccountFn.bind(SocialAccountConnector, user, socialType));
  } );

  if (deleteFunctions.length > 0)
  {
    async.series(deleteFunctions, function(error, results)
    {
      if (error)
        return workflow.emit('exception', error);

      workflow.emit('deleteUser', request, workflow, user);
    } );
  }
  else
    workflow.emit('deleteUser', request, workflow, user);
}

/*******************************************************************************
 * deleteUser
 *******************************************************************************
 * Delete the user.
 *
 * Inputs:
 *   request, workflow, user:
 */
function deleteUser(request, workflow, user)
{
  request.app.db.models.User.findByIdAndRemove(user.id, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.emit('response');
  });
}
