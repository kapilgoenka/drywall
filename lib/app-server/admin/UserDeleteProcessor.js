//
//  UserDeleteProcessor.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UserDeleteProcessor = module.exports;

var async = require('async'),
    _ = require('underscore'),
    wf = require('app-server/common/Workflow'),
    SignupUtil = require('app-server/signup/SignupUtil'),
    SocialAccountConnector = require('app-server/settings/SocialAccountConnector'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

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
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Delete User' });
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
      workflow.outcome.errors.push('You may not delete users.');
      return workflow.emit('response');
    }

    if (request.user._id == request.params.id)
    {
      workflow.outcome.errors.push('You may not delete yourself from user.');
      return workflow.emit('response');
    }

    workflow.emit('fetchUser', request, workflow, request.params.id);
  });
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
  RiakDBAccessor.findOne('users', userId, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (!user)
    {
      workflow.outcome.errors.push('User was not found.');
      return workflow.emit('response');
    }

    workflow.emit('deleteLinkedAccounts', request, workflow, user);
  });
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
  workflow.emit('deleteUserAccount', request, workflow, user);
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
  RiakDBAccessor.deleteBucket(user.username + '--media_curation', function(error, result)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.emit('deleteUserSocialAccounts', request, workflow, user);
  });
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
    var socialId = user.social && user.social[socialType];

    if (socialId)
      deleteFunctions.push(removeSocialAccountFn.bind(SocialAccountConnector, user, socialType));
  });

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
  RiakDBAccessor.remove('users', user._id, function(error)
  {
    if (error)
      return workflow.emit('exception', error);

    workflow.emit('response');
  });
}
