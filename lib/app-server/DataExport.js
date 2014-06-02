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

      response.set({ 'Cache-Control': 'no-cache' });
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
  var finalExportData = [];
  function formatObjectDate(date)
  {
    var _year = date.substr(4,4);
    var _month = date.substr(0,2);
    var _day = date.substr(2,2);
    return _month + '-' + _day + '-' + _year
  }
  function formatTrendsDate(date)
  {
    var _year = date.substr(0,4);
    var _month = date.substr(4,2);
    var _day = date.substr(6,2);
    return _month + '-' + _day + '-' + _year
  }
  function formatForViz()
  {
    return {
      formatTrends: function( value, metricType, metricEntity )
      {
        var trendsTotals = [];
        var trendsContinents = [];
        var metricTotal = 0;
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
                  trendsTotalMetricObj.metric = formatTrendsDate(trendsDateKey);
                  trendsTotalMetricObj.value = value[metricType][metricEntity].value.total[trendsDateKey];
                  metricTotal += trendsTotalMetricObj.value;
                  trendsTotals.push( trendsTotalMetricObj );
                }
              }
            }
          }
        }
        return { total: trendsTotals, metricType: 'trends', metricTotal: metricTotal};
      },
      formatAgeGender: function( value, metricType, metricEntity )
      {
        //create continents
        var ageContinents = [];
        var ageTotals = [];
        var metricTotal = 0;
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
                  metricTotal += ageTotalMetricObj.value;
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
        return { continents: ageContinents, total: ageTotals, metricType: 'ageRange', metricTotal: metricTotal};
      },
      formatLocations: function( value, metricType, metricEntity )
      {
        var metricTotal = 0;
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
              metricTotal += locObject.value;
              locationArray.push( locObject );
            }
          }
          return {value: { total: locationArray, metricType: 'locations', metricTotal: metricTotal }};
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
              gameLocObject.value = value[metricType][metricEntity][gameLocationKey].total;
              gameLocObject.teams = value[metricType][metricEntity][gameLocationKey].teams;
              metricTotal += gameLocObject.value;
              gameLocationArray.push( gameLocObject );
            }
          }
          return {value: { total: gameLocationArray, metricType: 'locations', metricTotal: metricTotal }};
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

    obj.type = value.type;
    obj.id = value.id;
    obj.mentions = value.mentions;
    obj.date = {
      startDate: formatObjectDate(date)
    };
    obj.metrics = {
      name: metricType,
      entities: entities
    };
    topics.push(obj);
  });

  function getEntityDetails( data )
  {
    var arr = [];
    var teamOneForGame = {};
    var teamTwoForGame = {};
    teamOneForGame.name = data.metrics.entities[1].name;
    teamTwoForGame.name = data.metrics.entities[2].name;
    teamOneForGame.metrics = data.metrics.entities[1].value.total;
    teamTwoForGame.metrics = data.metrics.entities[2].value.total;
    arr.push(teamOneForGame);
    arr.push(teamTwoForGame);
    return arr;
  }

  function createFinalEntity( data )
  {
    var formattedData = {};
    var metricsForDate = {};
    formattedData.id = data.id;
    formattedData.type = data.type;
    formattedData.metrics = {
      ageRange: [],
      gender: [],
      locations: [],
      trends: []
    };

    if ( data.type === 'games' )
    {
      if ( data.metrics.name !== 'locations' )
      {
        metricsForDate.teams = getEntityDetails( data );
        formattedData.teams = [
          {
            name: data.metrics.entities[1].name,
            primaryColor: 'undefined',
            secondaryColor: 'undefined'
          },
          {
            name: data.metrics.entities[2].name,
            primaryColor: 'undefined',
            secondaryColor: 'undefined'
          }
        ];
      }
    }
    else
    {
      formattedData.primaryColor = 'undefined';
      formattedData.secondaryColor = 'undefined';
    }

    metricsForDate.date = data.date;
    metricsForDate.name = data.metrics.name;
    metricsForDate.metrics = data.metrics.entities[0].value.total;
    metricsForDate.mentions = data.metrics.entities[0].value.metricTotal || 0;
    formattedData.metrics[data.metrics.name].push(metricsForDate);
    return formattedData;
  }

  function extendFinalEntity( data, extendObject )
  {
    var metricsForDate = {};
    if ( data.type === 'games' )
    {
      if ( data.metrics.name !== 'locations' )
      {
        metricsForDate.teams = getEntityDetails( data );
      }
    }
    metricsForDate.date = data.date;
    metricsForDate.name = data.metrics.name;
    metricsForDate.metrics = data.metrics.entities[0].value.total;
    metricsForDate.mentions = data.metrics.entities[0].value.metricTotal || 0;
    extendObject.metrics[data.metrics.name].push(metricsForDate);
  }

  topics.forEach(function( topic )
  {
    var shouldExtend = false;
    finalExportData.map(function( exportEntityItem )
    {
      if ( exportEntityItem.id === topic.id )
      {
        shouldExtend = true;
        extendFinalEntity( topic, exportEntityItem );
        return;
      }
    });
    if ( !shouldExtend )
    {
      finalExportData.push( createFinalEntity(topic) );
    }
  });

  return { topics: finalExportData };
}