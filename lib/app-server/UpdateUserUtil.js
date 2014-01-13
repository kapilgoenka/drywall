//
//  UpdateUserUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var UpdateUserUtil = module.exports;

var App = require('app').app,
    _ = require('underscore'),
    uuid = require('node-uuid'),
    UserAdmin = require('app-server/admin/UserAdmin');

/*******************************************************************************
 * patchUser
 *******************************************************************************
 * Update Username and email for a user.
 *
 * Inputs:
 *   userId, request, workflow, additionalFieldsToSet:
 */
UpdateUserUtil.patchUser = function(userId, request, workflow, additionalFieldsToSet)
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

  if (additionalFieldsToSet)
    _.extend(fieldsToSet, additionalFieldsToSet);

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

/*******************************************************************************
 * updateUserDuplicateUsernameCheck
 *******************************************************************************
 * See if the new username being requested by a current user is already in use.
 *
 * Inputs:
 *   newUsername, currentUserId, workflow, nextStep:
 */
UpdateUserUtil.updateUserDuplicateUsernameCheck = function(newUsername, currentUserId, request, workflow, nextStep)
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
UpdateUserUtil.updateUserDuplicateEmailCheck = function(newEmail, currentUserId, request, workflow, nextStep)
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
