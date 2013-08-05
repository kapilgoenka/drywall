//
//  AccountUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var AccountUtil = module.exports;

var App = require('app').app,
    _ = require('underscore');

/*******************************************************************************
 * patchUser
 *******************************************************************************
 * Update Username and email for a user.
 *
 * Inputs:
 *   userId, request, workflow, additionalFieldsToSet:
 */
AccountUtil.patchUser = function(userId, request, workflow, additionalFieldsToSet)
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

  request.app.db.models.User.findByIdAndUpdate(userId, fieldsToSet, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    user.populate('roles.admin roles.account', 'name.full', function(error, user)
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
AccountUtil.updateUserDuplicateUsernameCheck = function(newUsername, currentUserId, request, workflow, nextStep)
{
  request.app.db.models.User.findOne({ username: newUsername, _id: { $ne: currentUserId } }, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (user)
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
AccountUtil.updateUserDuplicateEmailCheck = function(newEmail, currentUserId, request, workflow, nextStep)
{
  request.app.db.models.User.findOne({ email: newEmail, _id: { $ne: currentUserId } }, function(error, user)
  {
    if (error)
      return workflow.emit('exception', error);

    if (user)
    {
      workflow.outcome.errfor.email = 'email already taken';
      return workflow.emit('response');
    }

    workflow.emit(nextStep);
  });
}
