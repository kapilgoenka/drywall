var DataExport = module.exports;
var _ = require('underscore');
var App = require('app').app;
var SignupUtil = require('app-server/signup/SignupUtil');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * getExportData
 *******************************************************************************
 * Return the data exported by the user (request.params.username)
 * for the given appId (request.params.appId)
 *
 * Inputs:
 *   request, response:
 */
DataExport.getExportData = function(request, response)
{
  var username = request.params.username;
  var appId = request.params.appId;

  // check if appId is valid
  if (App.get('APP_WHITELIST').indexOf(appId) === -1)
    return response.send(400, 'Invalid appId');

  // sanitize username to the format of the account system
  if (!SignupUtil.isValidUsernameFormat(username))
    username = username.replace(/[^a-zA-Z0-9\-\_]/g, '');

  // check if a user with given username exists in the db
  RiakDBAccessor.findOne('users', { username: username } , function(error, user)
  {
    if (error)
      return response.send(400, error);

    if (!user)
      return response.send(400, 'Invalid username');

    var bucket = username + '--' + appId;
    var exportKey = 'ExportData';

    RiakDBAccessor.findOne(bucket, exportKey, function(error, result)
    {
      if (error)
        return response.send(400, error);

      response.send(result);
    });
  });
};

/*******************************************************************************
 * updateExportData
 *******************************************************************************
 * Return the data exported by the user (request.params.username)
 * for the given appId (request.params.appId)
 *
 * Inputs:
 *   request, response:
 */
DataExport.updateExportData = function(request, response)
{
  var username = request.params.username;
  var appId = request.params.appId;

  // check if appId is valid
  if (App.get('APP_WHITELIST').indexOf(appId) === -1)
    return response.send(400, 'Invalid appId');

  // sanitize username to the format of the account system
  if (!SignupUtil.isValidUsernameFormat(username))
    username = username.replace(/[^a-zA-Z0-9\-\_]/g, '');

  // check if a user with given username exists in the db
  RiakDBAccessor.findOne('users', { username: username } , function(error, user)
  {
    if (error)
      return response.send(400, error);

    if (!user)
      return response.send(400, 'Invalid username');

    var bucket = username + '--' + appId;
    var exportKey = 'ExportData';

    // Get current value of exported data
    RiakDBAccessor.findOne(bucket, exportKey, function(error, exportData)
    {
      if (error)
        return response.send(400, error);

      // update exported data
      exportData = _.extend({}, exportData, request.body);

      // write to db
      RiakDBAccessor.update(bucket, exportKey, exportData, function(error, exportData)
      {
        if (error)
          return response.send(400, error);

        response.send(exportData);
      });
    });
  });
};

/*******************************************************************************
 * deleteExportData
 *******************************************************************************
 * Delete the data exported by the user (request.params.username)
 * for the given appId (request.params.appId)
 *
 * Inputs:
 *   request, response:
 */
DataExport.deleteExportData = function(request, response)
{
  var username = request.params.username;
  var appId = request.params.appId;

  // check if appId is valid
  if (App.get('APP_WHITELIST').indexOf(appId) === -1)
    return response.send(400, 'Invalid appId');

  // sanitize username to the format of the account system
  if (!SignupUtil.isValidUsernameFormat(username))
    username = username.replace(/[^a-zA-Z0-9\-\_]/g, '');

  // check if a user with given username exists in the db
  RiakDBAccessor.findOne('users', { username: username } , function(error, user)
  {
    if (error)
      return response.send(400, error);

    if (!user)
      return response.send(400, 'Invalid username');

    var bucket = username + '--' + appId;

    RiakDBAccessor.deleteBucket(bucket, function(error, result)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  });
};