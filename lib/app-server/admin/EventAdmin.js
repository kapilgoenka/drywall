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

function listPartners(callback)
{
  RiakDBAccessor.findOne('organizations', 'userMap', function(error, userMap)
  {
    if (error)
      return callback(error, null);

    var results = _(_.uniq(_(userMap).values())).map(function(partner)
    {
      return {
        displayName: partner,
        urlName: partner.replace(/ /g, '_')
      };
    });

    callback(null, results);
  });
}

/*******************************************************************************
 * list
 *******************************************************************************
 * List all events
 *
 * Inputs:
 *   request, response, next:
 */
 // /admin/events/
EventAdmin.list = function(request, response, next)
{
  function validate()
  {
    workflow.emit('getAllEvents');
  }

  function getAllEvents()
  {
    listEventBuckets(function(error, eventBuckets)
    {
      RiakDBAccessor.findOne('events', 'MetaData', function(error, metaData)
      {
        outcome.events = _(eventBuckets).map(function(eventBucket)
        {
          return {
            name: eventBucket.replace('--event', ''),
            displayName: (metaData[eventBucket] && metaData[eventBucket].displayName) || eventBucket.replace('--event', '')
          };
        });

        if (request.admin_xhr)
          return response.send(outcome);
        else
        {
          return response.render('admin/events/index', {
            data:
            {
              results: JSON.stringify(outcome.events),
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
EventAdmin.readEvent = function(request, response, next)
{
  var event = request.params.event;
  var eventBucket = event + '--event';

  RiakDBAccessor.listBucket(eventBucket, function(error, eventData)
  {
    if (error)
      return response.send(400, error);

    listPartners(function(error, partners)
    {
      var outcome = {};
      outcome.event = {};
      outcome.event.name = event;
      outcome.partners = partners;

      if (eventData.DataKeys)
        outcome.event.properties = _.pick(eventData, _(eventData.DataKeys).without('Templates'));
      else
        outcome.event.properties = eventData;

      if (request.admin_xhr)
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

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch partner-specific event info
 *
 * Inputs:
 *   request, response, next:
 */
 // /admin/events/:organization/:event
EventAdmin.readPartnerSpecificEvent = function(request, response, next)
{
  var event = request.params.event;
  var eventBucket = event + '--event';
  var partner = request.params.organization;
  var partnerSpecificEventBucket = partner + '--' + event + '--event';

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
      outcome.event.name = event;
      outcome.event.properties = {};

      _(eventData.DataKeys).each(function(key)
      {
        outcome.event.properties[key] = partnerSpecificEventData[key] || {};
      });

      if (request.admin_xhr)
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

EventAdmin.createEvent = function(request, response)
{
  var event = request.params.event;
  var eventBucket = event + '--event';

  RiakDBAccessor.update(eventBucket, 'DataKeys', [], function(error, result)
  {
    if (error)
      return response.send(400, error);

    response.send(200);
  });
};

// not doing shit on purpose!
EventAdmin.deleteEvent = function(request, response)
{
  response.send(200);
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

      workflow.emit('update');
    });
  }

  function update()
  {
    RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, dataKeys)
    {
      if (error)
        return response.send(400, error);

      if (!dataKeys)
        dataKeys = [];

      if (dataKeys.indexOf(property) === -1)
        dataKeys.push(property);

      RiakDBAccessor.update(eventBucket, 'DataKeys', dataKeys, function(error, dataKeys)
      {
        if (error)
          return response.send(400, error);

        RiakDBAccessor.update(eventBucket, property, request.body, function(error, result)
        {
          if (error)
            return response.send(400, error);

          response.send(200);
        });
      });
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update Event ' + event });
  workflow.on('validate', validate);
  workflow.on('update', update);
  workflow.emit('validate');
};

EventAdmin.updatePartnerSpecificEventProperty = function(request, response, next)
{
  var event = request.params.event;
  var eventBucket = event + '--event';
  var partner = request.params.organization;
  var property = request.params.property;
  var partnerSpecificEventBucket = partner + '--' + event + '--event';

  function validate()
  {
    listEventBuckets(function(error, eventBuckets)
    {
      if (error)
        return workflow.emit('exception', error);

      if (eventBuckets.indexOf(eventBucket) === -1)
      {
        workflow.outcome.errfor.event = 'Invalid event name';
        return workflow.emit('response');
      }

      RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, dataKeys)
      {
        if (error)
          return workflow.emit('exception', error);

        if (!dataKeys)
        {
          workflow.outcome.errfor.event = 'No DataKeys property found for event ' + event;
          return workflow.emit('response');
        }

        if (dataKeys.indexOf(property) === -1)
        {
          workflow.outcome.errfor.event = 'Property ' + property + 'not found in DataKeys for event ' + event;
          return workflow.emit('response');
        }

        workflow.emit('update');
      });
    });
  }

  function update()
  {
    RiakDBAccessor.update(partnerSpecificEventBucket, property, request.body, function(error, result)
    {
      if (error)
        return workflow.emit('exception', error);

      return workflow.emit('response');
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update ' + event + '/' + property + ' for ' + partner });
  workflow.on('validate', validate);
  workflow.on('update', update);
  workflow.emit('validate');
};

EventAdmin.deleteEventProperty = function(request, response, next)
{
  var eventName = request.params.event;
  var eventBucket = eventName + '--event';
  var property = request.params.property;

  function updateDataKeys()
  {
    RiakDBAccessor.findOne(eventBucket, 'DataKeys', function(error, dataKeys)
    {
      if (error)
        return response.send(400, error);

      if (!dataKeys)
        return response.send(400, 'No DataKeys found for event ' + eventName);

      if (dataKeys.indexOf(property) === -1)
        return response.send(400, 'Invalid property ' + property);

      dataKeys = _(dataKeys).without(property);

      RiakDBAccessor.update(eventBucket, 'DataKeys', dataKeys, function(error, result)
      {
        if (error)
          return response.send(400, error);

        workflow.emit('deleteProperty');
      });
    });
  }

  function deleteProperty()
  {
    RiakDBAccessor.remove(eventBucket, property, function(error)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Delete Event property ' + eventName });
  workflow.on('updateDataKeys', updateDataKeys);
  workflow.on('deleteProperty', deleteProperty);
  workflow.emit('updateDataKeys');
};
