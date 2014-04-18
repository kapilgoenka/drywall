var MediaCuration = module.exports;
var _ = require('underscore');
var async = require('async');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

MediaCuration.keys = ['sochi', 'superbowl48'];

/*******************************************************************************
 * getSavedQueries
 *******************************************************************************
 * Get saved queries
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.getSavedQueries = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;
  var property = 'savedQueries';

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  var bucket = request.user.username + '--' + 'media_curation';

  RiakDBAccessor.findOne(bucket, event, function(error, eventData)
  {
    if (error)
      return response.send(400, error);

    if (!eventData || !eventData[property])
      return response.send({});

     response.send(eventData[property]);
  });
};

/*******************************************************************************
 * updateSavedQueries
 *******************************************************************************
 * Get saved queries
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.updateSavedQueries = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;
  var property = 'savedQueries';

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  var bucket = request.user.username + '--' + 'media_curation';

  RiakDBAccessor.findOne(bucket, event, function(error, result)
  {
    if (error)
      return response.send(400, error);

    result = result || {};
    result[property] = request.body;

    RiakDBAccessor.update(bucket, event, result, function(error, account)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  });
};

/*******************************************************************************
 * getSavedResults
 *******************************************************************************
 * Get saved results
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.getSavedResults = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;
  var name = query.name;
  var property = 'savedResults';

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  if (!name)
    return response.send(400, 'Bad request. Missing saved results name');

  var bucket = request.user.username + '--' + 'media_curation';

  RiakDBAccessor.findOne(bucket, event, function(error, eventData)
  {
    if (error)
      return response.send(400, error);

    if (!eventData || !eventData[property])
      return response.send({});

     response.send(eventData[property][name]);
  });
};

/*******************************************************************************
 * updateSavedResults
 *******************************************************************************
 * Update saved results
 *
 * Inputs:
 *   request, response:
 */
MediaCuration.updateSavedResults = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;
  var name = query.name;
  var property = 'savedResults';

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  if (!name)
    return response.send(400, 'Bad request. Missing saved results name');

  var bucket = request.user.username + '--' + 'media_curation';

  RiakDBAccessor.findOne(bucket, event, function(error, result)
  {
    if (error)
      return response.send(400, error);

    result = result || {};
    result[property] = result[property] || {};
    result[property][name] = request.body;

    RiakDBAccessor.update(bucket, event, result, function(error, account)
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
  var eventName = request.params.eventName;
  var eventBucket = eventName + '--event';
  var outcome = {};

  if (!eventName)
    return response.send(400, 'Bad Request. Event name is required.');

  function getRecordFn(key, callback)
  {
    RiakDBAccessor.findOne(eventBucket, key, function(error, doc)
    {
      if (error)
        return callback(error, null);

      outcome.data = outcome.data || {};
      outcome.data[key] = doc || {};

      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return response.send(400, error);

    response.send(outcome);
  }

  RiakDBAccessor.findOne(eventBucket, 'Config', function(error, config)
  {
    if (error)
      return res.send(400, error);

    outcome.config = config || {};

    RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, keys)
    {
      if (error)
        return res.send(400, error);

      var fetchFunctions = {};
      _(keys).each(function(key)
      {
        fetchFunctions[key] = getRecordFn.bind(null, key);
      });

      async.parallel(fetchFunctions, asyncFinally);
    });
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
