//
//  OrganizationAdmin.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//
var OrganizationAdmin = module.exports,
    _ = require('underscore'),
    wf = require('app-server/common/Workflow'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * list
 *******************************************************************************
 * List all organizations
 *
 * Inputs:
 *   request, response, next:
 */
OrganizationAdmin.list = function(request, response, next)
{
  RiakDBAccessor.findOne('organizations', 'userMap', function(error, userMap)
  {
    if (error)
      return next(error);

    var results = _(_.uniq(_(userMap).values())).map(function(org)
    {
      return { displayName: org };
    });

    if (request.xhr)
    {
      response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      return response.send(results);
    }
    else
    {
      return response.render('admin/organizations/index', { data: { results: JSON.stringify(results) } });
    }
  });
};

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch an organization record.
 *
 * Inputs:
 *   request, response, next:
 */
OrganizationAdmin.read = function(request, response, next)
{
  function validate()
  {
    workflow.emit('getOrganizationUsers');
  }

  function getOrganizationUsers()
  {
    RiakDBAccessor.find('users', { organization: request.params.name }, function(error, users)
    {
      if (error)
        return next(error);

      outcome.users = users;
      workflow.emit('getAllEvents');
    });
  }

  function getAllEvents()
  {
    RiakDBAccessor.listBuckets(function(err, buckets)
    {
      var generic_event_buckets = _(buckets).filter(function(bucket)
      {
        var bucketNameContainsEvent = bucket.indexOf('event') !== -1;
        var bucketNameContainsExactlyOneSeparator = bucket.split('--').length === 2;
        return bucketNameContainsEvent && bucketNameContainsExactlyOneSeparator;
      });

      var organization_event_buckets = _(buckets).filter(function(bucket)
      {
        var bucketNameContainsEvent = bucket.indexOf('event') !== -1;
        var bucketNameContainsOrgName = bucket.indexOf(request.params.name) !== -1;
        var bucketNameContainsExactlyTwoSeparators = bucket.split('--').length === 3;
        return bucketNameContainsEvent && bucketNameContainsOrgName && bucketNameContainsExactlyTwoSeparators;
      });

      RiakDBAccessor.findOne('events', 'MetaData', function(error, metaData)
      {
        outcome.generic_events = _(generic_event_buckets).map(function(event)
        {
          return {
            name: event.replace('--event', ''),
            displayName: metaData[event].displayName,
            isCustomized: organization_event_buckets.indexOf(request.params.name + '--' + event) !== -1 ? 'YES' : 'NO'
          };
        });

        outcome.organization_events = _(organization_event_buckets).map(function(event)
        {
          return {
            name: event.replace('--event', '')
          };
        });

        outcome.displayName = request.params.name.replace('_', ' ');

        if (request.xhr)
          return response.send(outcome);
        else
        {
          return response.render('admin/organizations/details', {
            data:
            {
              name: outcome.displayName,
              results: JSON.stringify(outcome.users),
              events: JSON.stringify({
                all: outcome.generic_events,
                org: outcome.organization_events
              })
            }
          });
        }
      });
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow(request, response);
  workflow.on('validate', validate);
  workflow.on('getOrganizationUsers', getOrganizationUsers);
  workflow.on('getAllEvents', getAllEvents);
  workflow.emit('validate');
};
