var SavedQueries = module.exports;
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * getSavedQueriesForEvent
 *******************************************************************************
 * Get saved queries for event
 *
 * Inputs:
 *   request, response:
 */
SavedQueries.getSavedQueriesForEvent = function(request, response)
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

     response.set({ 'Cache-Control': 'no-cache' });
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
SavedQueries.updateSavedQueriesForEvent = function(request, response)
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