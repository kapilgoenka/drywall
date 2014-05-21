var MediaCuration = module.exports;
var _ = require('underscore');
var async = require('async');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');
var OrganizationAdmin = require('lib/app-server/admin/OrganizationAdmin');
MediaCuration.keys = ['sochi', 'superbowl48'];

/*******************************************************************************
 * getSavedQueriesForEvent
 *******************************************************************************
 * Get saved queries for event
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.getSavedQueriesForEvent = function(request, response)
{
  if (!request.params.event)
    return response.send(400, 'Bad request. Missing event name');

  var event = request.params.event;
  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'SavedQueries';

  RiakDBAccessor.findOne(bucket, key, function(error, savedQueries)
  {
    if (error)
      return response.send(400, error);

    if (!savedQueries || !savedQueries[event])
      return response.send({});

     response.send(savedQueries[event]);
  });
};

/*******************************************************************************
 * updateSavedQueriesForEvent
 *******************************************************************************
 * Update saved queries for event
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.updateSavedQueriesForEvent = function(request, response)
{
  if (!request.params.event)
    return response.send(400, 'Bad request. Missing event name');

  var event = request.params.event;
  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'SavedQueries';

  RiakDBAccessor.findOne(bucket, key, function(error, result)
  {
    if (error)
      return response.send(400, error);

    result = result || {};
    result[event] = request.body;

    RiakDBAccessor.update(bucket, key, result, function(error, account)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  });
};

/*******************************************************************************
 * getAllSavedResultsForEvent
 *******************************************************************************
 * Get all saved results for event
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.getAllSavedResultsForEvent = function(request, response)
{
  if (!query.params.event)
    return response.send(400, 'Bad request. Missing event name');

  var event = query.params.event;
  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'SavedResults';

  RiakDBAccessor.findOne(bucket, key, function(error, savedResults)
  {
    if (error)
      return response.send(400, error);

    if (!savedResults || !savedResults[event])
      return response.send({});

     response.send(savedResults[event]);
  });
};

/*******************************************************************************
 * getSavedResultWithNameForEvent
 *******************************************************************************
 * Get saved result with name for event
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.getSavedResultWithNameForEvent = function(request, response)
{
  if (!query.params.event)
    return response.send(400, 'Bad request. Missing event name');

  if (!query.params.resultName)
    return response.send(400, 'Bad request. Missing saved results name');

  var event = query.params.event;
  var resultName = query.params.resultName;
  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'SavedResults';

  RiakDBAccessor.findOne(bucket, key, function(error, savedResults)
  {
    if (error)
      return response.send(400, error);

    if (!savedResults || !savedResults[event])
      return response.send({});

     response.send(savedResults[event][resultName]);
  });
};

/*******************************************************************************
 * updateSavedResultWithNameForEvent
 *******************************************************************************
 * Update saved result with name for event
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.updateSavedResultWithNameForEvent = function(request, response)
{
  if (!query.params.event)
    return response.send(400, 'Bad request. Missing event name');

  if (!query.params.resultName)
    return response.send(400, 'Bad request. Missing saved results name');

  var event = query.params.event;
  var resultName = query.params.resultName;
  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'SavedResults';

  RiakDBAccessor.findOne(bucket, key, function(error, savedResults)
  {
    if (error)
      return response.send(400, error);

    savedResults = savedResults || {};
    savedResults[event] = savedResults[event] || {};
    savedResults[event][resultName] = request.body;

    RiakDBAccessor.update(bucket, key, savedResults, function(error, account)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  });
};

MediaCuration.getEventProperty = function(request, response)
{
  if (!request.params.eventName || !request.params.property)
    return {};

  var bucket = request.params.eventName + '--event';
  RiakDBAccessor.findOne(bucket, request.params.property, function(error, data)
  {
    if (error)
      return res.send(400, error);

    response.send(data);
  });
};

MediaCuration.getEventConfigAndData = function(request, response)
{
  var event = request.params.event;
  var eventBucket = event + '--event';
  var partner = request.user.organization;
  var partnerBucket = partner + '--event';
  var partnerSpecificEventBucket = partner + '--' + eventBucket;
  var outcome = {
    data: {
      event_level: {},
      partner_level: {},
      partner_event_specific:{}
    }
  };

  if (!event)
    return response.send(400, 'Bad Request. Event name is required.');

  function getEventProperty(key, callback)
  {
    RiakDBAccessor.findOne(eventBucket, key, function(error, eventVal)
    {
      if (error)
        return callback(error, null);

      outcome.data.event_level[key] = eventVal || {};
      callback(null, 'done');
    });
  }

  function getPartnerSpecificEventProperty(key, callback)
  {
    RiakDBAccessor.findOne(partnerSpecificEventBucket, key, function(error, partnerSpecificEventVal)
    {
      if (error)
        return callback(error, null);

      outcome.data.partner_event_specific[key] = partnerSpecificEventVal || {};
      callback(null, 'done');
    });
  }

  function getPartnerProperties(callback)
  {
    OrganizationAdmin.getPartnerProperties(partner, function(error, properties)
    {
      if (error)
        return callback(error, null);

      outcome.data.partner_level = properties;
      callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return response.send(400, error);

    response.send(outcome);
  }

  RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, keys)
  {
    if (error)
      return res.send(400, error);

    var fetchFunctions = [];
    _(keys).each(function(key)
    {
      fetchFunctions.push(getEventProperty.bind(null, key));
      fetchFunctions.push(getPartnerSpecificEventProperty.bind(null, key));
    });

    fetchFunctions.push(getPartnerProperties.bind(null));

    async.parallel(fetchFunctions, asyncFinally);
  });
};

MediaCuration.getPartnerSepecificEventProperty = function(request, response)
{
  var event = request.params.eventName;
  var property = request.params.property;
  var organization = request.user.organization;

  if (!event)
    return response.send(400, 'Bad Request. Event name is required.');

  if (!property)
    return response.send(400, 'Bad Request. Property name is required.');

  var bucket = organization + '--' + event + '--event';

  RiakDBAccessor.findOne(bucket, property, function(error, data)
  {
    if (error)
      return res.send(400, error);

    response.send(data);
  });
};
