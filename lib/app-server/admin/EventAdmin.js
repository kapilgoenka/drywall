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
  var workflow = new wf.Workflow(request, response);
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
 // /admin/organizations/:orgname/events/
EventAdmin.read = function(request, response, next)
{
  var eventName = request.params.event;
  var eventBucket = eventName + '--event';
  var outcome = {
    event:
    {
      name: eventName,
      properties: { }
    }
  };

  function getRecord(key, callback)
  {
    RiakDBAccessor.findOne(eventBucket, key, function(error, doc)
    {
      if (error)
        return callback(error, null);

      outcome.event.properties[key] = doc || {};

      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    if (error)
      return next(error);

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
  }

  var getRecordFn = getRecord;
  var fetchFunctions = {};

  RiakDBAccessor.listKeys(eventBucket, function(error, keys)
  {
    _(keys).each(function(key)
    {
      if (key !== 'Metadata')
      {
        fetchFunctions[key] = getRecordFn.bind(null, key);
      }
    });

    async.parallel(fetchFunctions, asyncFinally);
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
  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('update', update);
  workflow.emit('validate');
};