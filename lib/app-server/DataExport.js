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

      if ( appId === 'keyword_insights' )
        return response.send( insightsDataConverter( result ) );

      response.send( result );
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

/*******************************************************************************
 * insightsDataConverter
 *******************************************************************************
 * Proccesses ingihts export data so it can be served in a format differet than the persisted format
 *
 * Inputs:
 *   request, response:
 */
function insightsDataConverter( response )
{
  var topics = [];

  _( response ).each( function( value, key )
  {
    var key_components = key.split('_');
    var entities = [];
    var metricType = key_components[2]; // metrics metricType
    var date = key_components[1]; // date
    var slug = key_components[0]; // entity
    var obj = {};

    for ( var metricEntity in value[metricType] )
    {
      if ( value[metricType].hasOwnProperty(metricEntity) )
      {
        //prefix trends
        if ( metricType === 'trends' )
        {
          for ( var trendsKey in value[metricType][metricEntity].value )
          {
            if ( value[metricType][metricEntity].value.hasOwnProperty(trendsKey) )
            {
              if ( trendsKey !== 'total'  ){
                value[metricType][metricEntity].value['_'+trendsKey] = value[metricType][metricEntity].value[trendsKey];
                delete value[metricType][metricEntity].value[trendsKey];
              }
              else
              {
                for ( var trendsTotalKey in value[metricType][metricEntity].value.total )
                {
                  if ( value[metricType][metricEntity].value.total.hasOwnProperty(trendsTotalKey) )
                  {
                    value[metricType][metricEntity].value.total['_'+trendsTotalKey] = value[metricType][metricEntity].value.total[trendsTotalKey];
                    delete value[metricType][metricEntity].value.total[trendsTotalKey];
                  }
                }
              }
            }
          }
        }
        //prefix ages
        else if ( metricType === 'ageRange' )
        {
          for ( var ageKey in value[metricType][metricEntity].value )
          {
            if ( value[metricType][metricEntity].value.hasOwnProperty(ageKey) )
            {
              if ( ageKey === 'total'  ){
                for ( var ageTotalKey in value[metricType][metricEntity].value.total )
                {
                  if ( value[metricType][metricEntity].value.total.hasOwnProperty(ageTotalKey) )
                  {
                    value[metricType][metricEntity].value.total['_'+ageTotalKey] = value[metricType][metricEntity].value.total[ageTotalKey];
                    delete value[metricType][metricEntity].value.total[ageTotalKey];
                  }
                }
              }
              else
              {
                for ( var countryKey in value[metricType][metricEntity].value[ageKey] )
                {
                  for ( var countryAgeKey in value[metricType][metricEntity].value[ageKey][countryKey] )
                  {
                    if ( value[metricType][metricEntity].value[ageKey][countryKey].hasOwnProperty(countryAgeKey) )
                    {
                      if ( countryAgeKey !== 'unknown' )
                      {
                        value[metricType][metricEntity].value[ageKey][countryKey]['_'+countryAgeKey] = value[metricType][metricEntity].value[ageKey][countryKey][countryAgeKey];
                        delete value[metricType][metricEntity].value[ageKey][countryKey][countryAgeKey];
                      }
                    }
                  }
                }
              }
            }
          }
        }
        entities.unshift( value[metricType][metricEntity] );
      }
    }

    obj.type = value.type;
    obj.date = {
      startDate: date
    };
    obj.metrics = {
      name: metricType,
      entities: entities
    };

    topics.push(obj);
  });

  return { topics: topics };
}