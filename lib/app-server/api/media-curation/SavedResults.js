var SavedResults = module.exports;
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * getAllSavedResultsForEvent
 *******************************************************************************
 * Get all saved results for event
 *
 * Inputs:
 *   request, response:
 */
SavedResults.getAllSavedResultsForEvent = function(request, response)
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
SavedResults.getSavedResultWithNameForEvent = function(request, response)
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
SavedResults.updateSavedResultWithNameForEvent = function(request, response)
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