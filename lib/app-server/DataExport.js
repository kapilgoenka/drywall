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
 *   exportdata:
 */
function insightsDataConverter( exportdata )
{
  var topics = [];
  function formatForViz()
  {
    return {
      formatTrends: function( value, metricType, metricEntity )
      {
        var trendsTotals = [];
        var trendsContinents = [];
        for ( var trendsKey in value[metricType][metricEntity].value )
        {
          if ( value[metricType][metricEntity].value.hasOwnProperty(trendsKey) )
          {
            if ( trendsKey === 'total'  ){
              for ( var trendsDateKey in value[metricType][metricEntity].value.total )
              {
                if ( value[metricType][metricEntity].value.total.hasOwnProperty(trendsDateKey) )
                {
                  var trendsTotalMetricObj = {};
                  trendsTotalMetricObj.metric = trendsDateKey;
                  trendsTotalMetricObj.value = value[metricType][metricEntity].value.total[trendsDateKey];
                  trendsTotals.push( trendsTotalMetricObj );
                }
              }
            }
          }
        }
        return { total: trendsTotals, metricType: 'trends'};
      },
      formatAgeGender: function( value, metricType, metricEntity )
      {
        //create continents
        var ageContinents = [];
        var ageTotals = [];
        for ( var ageContinent in value[metricType][metricEntity].value )
        {
          var ageContinentObj = {};
          if ( value[metricType][metricEntity].value.hasOwnProperty(ageContinent) )
          {
            //create countries
            ageContinentObj.countries = [];
            ageContinentObj.name = ageContinent;
            if ( ageContinent === 'total'  ){
              for ( var agederTotalKey in value[metricType][metricEntity].value.total )
              {
                if ( value[metricType][metricEntity].value.total.hasOwnProperty(agederTotalKey) )
                {
                  var ageTotalMetricObj = {};
                  ageTotalMetricObj.metric = agederTotalKey;
                  ageTotalMetricObj.value = value[metricType][metricEntity].value.total[agederTotalKey];
                  ageTotals.push( ageTotalMetricObj );
                }
              }
            }
            else
            {
              for ( var ageCountry in value[metricType][metricEntity].value[ageContinent] )
              {
                var ageCountryObj = {};
                ageCountryObj.name = ageCountry;
                ageCountryObj.metrics = [];
                for ( var countryagederKey in value[metricType][metricEntity].value[ageContinent][ageCountry] )
                {
                  if ( value[metricType][metricEntity].value[ageContinent][ageCountry].hasOwnProperty(countryagederKey) )
                  {
                    if ( countryagederKey !== 'unknown' )
                    {
                      var ageCountryMetricObj = {};
                      ageCountryMetricObj.metric = countryagederKey;
                      ageCountryMetricObj.value = value[metricType][metricEntity].value[ageContinent][ageCountry][countryagederKey];
                      ageCountryObj.metrics.push( ageCountryMetricObj );
                    }
                  }
                }
                ageContinentObj.countries.push(ageCountryObj);
              }
            }
          }
          ageContinents.push(ageContinentObj);
        }
        return { continents: ageContinents, total: ageTotals, metricType: 'ageRange'};
      },
      formatLocations: function( value, metricType, metricEntity )
      {
        if ( value.type !== 'games' )
        {
          var locationArray = [];
          for ( var locationKey in value[metricType][metricEntity].value )
          {
            if ( value[metricType][metricEntity].value.hasOwnProperty(locationKey) )
            {
              var locObject = {};
              locObject.metric = locationKey;
              locObject.value = value[metricType][metricEntity].value[locationKey];
              locationArray.push( locObject );
            }
          }
          return {value: { total: locationArray, metricType: 'locations' }};
        }
        else
        {
          var gameLocationArray = [];
          for ( var gameLocationKey in value[metricType][metricEntity])
          {
            if ( value[metricType][metricEntity].hasOwnProperty(gameLocationKey) )
            {
              var gameLocObject = {};
              gameLocObject.metric = gameLocationKey;
              gameLocObject.value = value[metricType][metricEntity][gameLocationKey];
              gameLocationArray.push( gameLocObject );
            }
          }
          return {value: { total: gameLocationArray, metricType: 'locations' }};
        }
      }
    };
  }

  _( exportdata ).each( function( value, key )
  {
    var key_components = key.split('_');
    var entities = [];
    var metricType = key_components[2]; // metrics metricType
    var date = key_components[1]; // date
    var slug = key_components[0]; // entity
    var obj = {};

    if ( metricType !== 'all' )
    {
      for ( var metricEntity in value[metricType] )
      {
        if ( value[metricType].hasOwnProperty(metricEntity) )
        {
          if ( metricType === 'trends' )
          {
            value[metricType][metricEntity].value = formatForViz().formatTrends( value, metricType, metricEntity );
          }
          else if ( metricType === 'ageRange' )
          {
            value[metricType][metricEntity].value = formatForViz().formatAgeGender( value, metricType, metricEntity );
          }
          else if ( metricType === 'gender' )
          {
            value[metricType][metricEntity].value = formatForViz().formatAgeGender( value, metricType, metricEntity );
          }
          else if ( metricType === 'locations' )
          {
            value[metricType][metricEntity] = formatForViz().formatLocations( value, metricType, metricEntity );
          }
          entities.unshift( value[metricType][metricEntity] );
        }
      }
    }
    else
    {
      for ( var allMetricsType in value )
      {
        var allMetricsEntity;
        if ( allMetricsType === 'trends' )
        {
          for ( allMetricsEntity in value[allMetricsType] )
          {
            value[allMetricsType][allMetricsEntity].value = formatForViz().formatTrends( value, allMetricsType, allMetricsEntity );
          }
        }
        else if ( allMetricsType === 'ageRange' )
        {
          for ( allMetricsEntity in value[allMetricsType] )
          {
            value[allMetricsType][allMetricsEntity].value = formatForViz().formatAgeGender( value, allMetricsType, allMetricsEntity );
          }
        }
        else if ( allMetricsType === 'gender' )
        {
          for ( allMetricsEntity in value[allMetricsType] )
          {
            value[allMetricsType][allMetricsEntity].value = formatForViz().formatAgeGender( value, allMetricsType, allMetricsEntity );
          }
        }
        else if ( allMetricsType === 'locations' )
        {
          for ( allMetricsEntity in value[allMetricsType] )
          {
            value[allMetricsType][allMetricsEntity] = formatForViz().formatLocations( value, allMetricsType, allMetricsEntity );
          }
        }
        entities.unshift( value[allMetricsType][allMetricsEntity] );
      }
    }
    obj.type = value.type;
    obj.id = value.id;
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