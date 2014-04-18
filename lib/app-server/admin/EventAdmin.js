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
 // /admin/events/:name
EventAdmin.read = function(request, response, next)
{
  var eventName = request.params.event;
  var eventBucket = eventName + '--event';

  RiakDBAccessor.listBucket(eventBucket, function(error, result)
  {
    if (error)
      return next(error);

    RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, dataKeys)
    {
      if (error)
        return next(error);

      var outcome = {
        event:
        {
          name: eventName,
          properties: _.pick(result, dataKeys)
        }
      };

      if (request.xhr)
        response.send(outcome);
      else
      {
        response.render('admin/events/details.handlebars',
        {
          data: { record: JSON.stringify(outcome) },
          feet: "<script src='/views/admin/events/details.js'></script>",
          neck: "<link rel='stylesheet' href='/views/admin/events/details.css'>",
          title: 'Events / Details',
          layout: 'admin'
        });
      }
    });
  });
};

EventAdmin.update = function(request, response, next)
{
  function validate()
  {
    var eventName = request.params.eventName;
    var reqBody = request.body;

    if (eventName && reqBody)
      workflow.emit('update');
  }

  function update()
  {
    response.send(200);
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update Event' + request.params.eventName });
  workflow.on('validate', validate);
  workflow.on('update', update);
  workflow.emit('validate');
};