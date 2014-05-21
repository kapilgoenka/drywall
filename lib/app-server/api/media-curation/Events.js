var Events = module.exports;
var _ = require('underscore');
var async = require('async');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');
var OrganizationAdmin = require('lib/app-server/admin/OrganizationAdmin');

Events.getEventProperty = function(request, response)
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

Events.getEventConfigAndData = function(request, response)
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
