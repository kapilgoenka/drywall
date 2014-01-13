var MediaCuration = module.exports;
var App = require('app').app;
var _ = require('underscore');

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
  App.db.findOne(bucket, key, function(error, savedQueries)
  {
    if (error)
      return res.send(400, error);

    if (!savedQueries || !savedQueries[event])
      return response.send({});

    response.send(savedQueries[event]);
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
  var key = 'savedQueries';
  var value = {};
  value[event] = request.body;
  App.db.update(bucket, key, value, function(error, account)
  {
    if (error)
      return response.send(400, 'Error saving queries');

    response.send(200);
  });
};