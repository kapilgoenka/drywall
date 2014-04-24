//
//  EventAdmin.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//
var EventAdmin = module.exports,
    _ = require('underscore'),
    async = require('async'),
    wf = require('app-server/common/Workflow'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

function listEventBuckets(callback)
{
  RiakDBAccessor.listBuckets(function(error, buckets)
  {
    if (error)
      return callback(error, null);

    var eventBuckets = _(buckets).filter(function(bucket)
    {
      var bucketNameContainsEvent = bucket.indexOf('event') !== -1;
      var bucketNameContainsExactlyOneSeparator = bucket.split('--').length === 2;
      return bucketNameContainsEvent && bucketNameContainsExactlyOneSeparator;
    });

    callback(null, eventBuckets);
  });
}

EventAdmin.list = function(request, response, next)
{
  function validate()
  {
    workflow.emit('getAllEvents');
  }

  function getAllEvents()
  {
    RiakDBAccessor.listBuckets(function(err, buckets)
    {
      RiakDBAccessor.findOne('events', 'MetaData', function(error, metaData)
      {
        var generic_event_buckets = _(buckets).filter(function(bucket)
        {
          var bucketNameContainsEvent = bucket.indexOf('event') !== -1;
          var bucketNameContainsExactlyOneSeparator = bucket.split('--').length === 2;
          return bucketNameContainsEvent && bucketNameContainsExactlyOneSeparator;
        });

        outcome.generic_events = _(generic_event_buckets).map(function(event)
        {
          return {
            name: event.replace('--event', ''),
            displayName: metaData[event].displayName
          };
        });

        if (request.xhr)
          return response.send(outcome);
        else
        {
          return response.render('admin/events/index', {
            data:
            {
              results: JSON.stringify(outcome.generic_events),
            }
          });
        }
      });
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'List Events' });
  workflow.on('validate', validate);
  workflow.on('getAllEvents', getAllEvents);
  workflow.emit('validate');
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch event info
 *
 * Inputs:
 *   request, response, next:
 */
 // /admin/events/:event
 // /admin/organizations/:organization/:event
EventAdmin.readEvent = function(request, response, next)
{
  var eventName = request.params.event;
  var eventBucket = eventName + '--event';

  RiakDBAccessor.listBucket(eventBucket, function(error, result)
  {
    if (error)
      return response.send(400, error);

    var outcome = {};
    outcome.event = {};
    outcome.event.name = eventName;

    if (result.DataKeys)
      outcome.event.properties = _.pick(result, _(result.DataKeys).without('Templates'));
    else
      outcome.event.properties = result;

    if (request.xhr)
      response.send(outcome);
    else
    {
      response.render('admin/events/details.handlebars',
      {
        data: { record: JSON.stringify(outcome) },
        feet: "<script src='/vendor/jquery-tidy-table/jquery.tidy.table.min.js'></script><script src='/views/admin/events/details.js'></script>",
        neck: "<link rel='stylesheet' href='/vendor/jquery-tidy-table/jquery.tidy.table.min.css'><link rel='stylesheet' href='/views/admin/events/details.css'>",
        title: 'Events / Details',
        layout: 'admin'
      });
    }
  });
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch partner-specific event info
 *
 * Inputs:
 *   request, response, next:
 */
 // /admin/organizations/:organization/:event
EventAdmin.readPartnerSpecificEvent = function(request, response, next)
{
  var eventName = request.params.event;
  var partnerName = request.params.organization;
  var eventBucket = eventName + '--event';
  var partnerSpecificEventBucket = partnerName + '--' + eventName + '--event';

  RiakDBAccessor.listBucket(eventBucket, function(error, eventData)
  {
    if (error)
      return response.send(400, error);

    RiakDBAccessor.listBucket(partnerSpecificEventBucket, function(error, partnerSpecificEventData)
    {
      if (error)
        return response.send(400, error);

      var outcome = {};
      outcome.event = {};
      outcome.event.name = eventName;
      outcome.event.properties = {};

      _(eventData.DataKeys).each(function(key)
      {
        outcome.event.properties[key] = partnerSpecificEventData[key] || {};
      });

      // if (eventData.dataKeys)
      //   outcome.event.properties = _.pick(eventData, _(dataKeys).without('Templates'));
      // else
      //   outcome.event.properties = eventData;

      if (request.xhr)
        response.send(outcome);
      else
      {
        response.render('admin/events/details.handlebars',
        {
          data: { record: JSON.stringify(outcome) },
          feet: "<script src='/vendor/jquery-tidy-table/jquery.tidy.table.min.js'></script><script src='/views/admin/events/details.js'></script>",
          neck: "<link rel='stylesheet' href='/vendor/jquery-tidy-table/jquery.tidy.table.min.css'><link rel='stylesheet' href='/views/admin/events/details.css'>",
          title: 'Events / Details',
          layout: 'admin'
        });
      }
    });
  });
};

EventAdmin.updateEventProperty = function(request, response, next)
{
  var event = request.params.event;
  var eventBucket = event + '--event';
  var property = request.params.property;

  function validate()
  {
    listEventBuckets(function(error, eventBuckets)
    {
      if (error)
        return response.send(400, error);

      if (eventBuckets.indexOf(eventBucket) === -1)
        return response.send(400, 'Bad Request. Invalid event name');

      RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, dataKeys)
      {
        if (error)
          return response.send(400, error);

        if (!dataKeys)
          return response.send(400, 'No DataKeys found for event ' + event);

        if (dataKeys.indexOf(property) === -1)
          return response.send(400, 'Property ' + property + 'not found in DataKeys for event ' + event);

        workflow.emit('update');
      });
    });
  }

  function update()
  {
    RiakDBAccessor.update(eventBucket, property, request.body, function(error, result)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update Event' + event });
  workflow.on('validate', validate);
  workflow.on('update', update);
  workflow.emit('validate');
};