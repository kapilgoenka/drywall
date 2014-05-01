//
//  OrganizationAdmin.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//
var OrganizationAdmin = module.exports,
    _ = require('underscore'),
    async = require('async'),
    wf = require('app-server/common/Workflow'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

var PARTNER_BUCKET_SUFFIX = '--partner';

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
      return response.send(400, error);

    var results = _(_.uniq(_(userMap).values())).map(function(org)
    {
      return {
        displayName: org,
        urlName: org.replace(/ /g, '_')
      };
    });

    if (request.admin_xhr)
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
    workflow.emit('getPartnerUsers');
  }

  function getPartnerUsers()
  {
    RiakDBAccessor.find('users', { organization: request.params.name }, function(error, users)
    {
      if (error)
        return response.send(400, error);

      outcome.users = users;
      workflow.emit('getPartnerProperties');
    });
  }

  function getPartnerProperties()
  {
    var partner = request.params.name;
    var partnerBucket = partner + PARTNER_BUCKET_SUFFIX;
    outcome.event = {};
    outcome.event.name = partner;

    OrganizationAdmin.getPartnerProperties(partner, function(error, properties)
    {
      if (error)
        return response.send(400, error);

      outcome.event.properties = properties;

      if (request.admin_xhr)
        response.send(outcome);
      else
      {
        var scriptIncludes = [
          "<script src='/vendor/jquery-tidy-table/jquery.tidy.table.min.js'></script>",
          "<script src='/views/admin/events/details.js'></script>"
        ];

        var styleIncludes = [
          "<link rel='stylesheet' href='/vendor/jquery-tidy-table/jquery.tidy.table.min.css'>",
          "<link rel='stylesheet' href='/views/admin/events/details.css'>"
        ];

        response.render('admin/events/details.handlebars',
        {
          data: { results: JSON.stringify(outcome.users), record: JSON.stringify(outcome) },
          feet: scriptIncludes.join(),
          neck: styleIncludes.join(),
          title: 'Events / Details',
          layout: 'admin'
        });
      }
    });
  }

  var outcome = {};
  var workflow = new wf.Workflow({ request: request, response: response, name: 'Get partner details: ' + request.params.name });
  workflow.on('validate', validate);
  workflow.on('getPartnerUsers', getPartnerUsers);
  workflow.on('getPartnerProperties', getPartnerProperties);
  workflow.emit('validate');
};

OrganizationAdmin.getPartnerProperties = function(partner, callback)
{
  var partnerBucket = partner + PARTNER_BUCKET_SUFFIX;
  var outcome = {};

  function getRecord(key, callback)
  {
    RiakDBAccessor.findOne(partnerBucket, key, function(error, doc)
    {
      if (error)
        return callback(error, null);

      outcome[key] = doc || {};

      return callback(null, 'done');
    });
  }

  function asyncFinally(error, results)
  {
    callback(error, outcome);
  }

  RiakDBAccessor.findOne(partnerBucket, 'DataKeys', function(error, dataKeys)
  {
    if (error)
      return response.send(400, error);

    var getRecordFn = getRecord;
    var fetchFunctions = {};

    _(dataKeys).each(function(key)
    {
      fetchFunctions[key] = getRecordFn.bind(null, key);
    });

    async.parallel(fetchFunctions, asyncFinally);
  });
};

OrganizationAdmin.updatePartnerProperty = function(request, response, next)
{
  var partner = request.params.organization;
  var partnerBucket = partner + PARTNER_BUCKET_SUFFIX;
  var property = request.params.property;

  function validate()
  {
    workflow.emit('updateDataKeys');
  }

  function updateDataKeys()
  {
    RiakDBAccessor.findOne(partnerBucket, 'DataKeys', function(error, dataKeys)
    {
      if (error)
        return response.send(400, error);

      if (!dataKeys)
        dataKeys = [];

      if (dataKeys.indexOf(property) === -1)
        dataKeys.push(property);

      RiakDBAccessor.update(partnerBucket, 'DataKeys', dataKeys, function(error, result)
      {
        if (error)
          return response.send(400, error);

        workflow.emit('updateProperty');
      });
    });
  }

  function updateProperty()
  {
    RiakDBAccessor.update(partnerBucket, property, request.body, function(error, result)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Update property ' + property + ' for ' + partner });
  workflow.on('validate', validate);
  workflow.on('updateDataKeys', updateDataKeys);
  workflow.on('updateProperty', updateProperty);
  workflow.emit('validate');
};

OrganizationAdmin.deletePartnerProperty = function(request, response, next)
{
  var partnerName = request.params.organization;
  var partnerBucket = partnerName + PARTNER_BUCKET_SUFFIX;
  var property = request.params.property;

  function validate()
  {
    workflow.emit('updateDataKeys');
  }

  function updateDataKeys()
  {
    RiakDBAccessor.findOne(partnerBucket, 'DataKeys', function(error, dataKeys)
    {
      if (error)
        return response.send(400, error);

      if (!dataKeys)
        return response.send(400, 'No DataKeys found for partner ' + partnerName);

      if (dataKeys.indexOf(property) === -1)
        return response.send(400, 'Invalid property ' + property);

      dataKeys = _(dataKeys).without(property);

      RiakDBAccessor.update(partnerBucket, 'DataKeys', dataKeys, function(error, result)
      {
        if (error)
          return response.send(400, error);

        workflow.emit('deleteProperty');
      });
    });
  }

  function deleteProperty()
  {
    RiakDBAccessor.remove(partnerBucket, property, function(error)
    {
      if (error)
        return response.send(400, error);

      response.send(200);
    });
  }

  var workflow = new wf.Workflow({ request: request, response: response, name: 'Delete Partner property ' + partnerName });
  workflow.on('validate', validate);
  workflow.on('updateDataKeys', updateDataKeys);
  workflow.on('deleteProperty', deleteProperty);
  workflow.emit('validate');
};
