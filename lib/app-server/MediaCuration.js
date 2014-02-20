var MediaCuration = module.exports;
var App = require('app').app;
var _ = require('underscore');

MediaCuration.keys = ['savedQueries', 'instagramAccounts'];

MediaCuration.getSavedQueries = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  var bucket = request.user.username + '--' + 'media_curation';
  var key = 'savedQueries';

  App.db.findOne(bucket, event, function(error, eventData)
  {
    if (error)
      return res.send(400, error);

    if (!eventData || !eventData.savedQueries)
      return response.send({});

    response.send(eventData.savedQueries);
  });
};

MediaCuration.updateSavedQueries = function(request, response)
{
  if (!request.query.q)
    return response.send(400, 'Bad request. Missing query params');

  var query = JSON.parse(request.query.q);
  var event = query.event;

  if (!event)
    return response.send(400, 'Bad request. Missing event name');

  var bucket = request.user.username + '--' + 'media_curation';

  App.db.findOne(bucket, event, function(error, eventData)
  {
    if (error)
      return res.send(400, error);

    eventData = eventData || {};
    eventData['savedQueries'] = request.body;

    App.db.update(bucket, event, eventData, function(error, account)
    {
      if (error)
        return response.send(400, 'Error saving queries');

      response.send(200);
    });
  });
};

MediaCuration.getEventProperty = function(request, response)
{
  if (!request.params.eventName || !request.params.property)
    return {};

  var bucket = request.params.eventName + '--event';
  App.db.find(bucket, request.params.property, function(error, data)
  {
    if (error)
      return res.send(400, error);

    response.send(data);
  });
};

