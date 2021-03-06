var RiakDBAccessor = module.exports;
var Config = require('app-server/config');
var riak = require('nodiak').getClient('http', Config.riak.host, Config.riak.port);
var _ = require('underscore');
var async = require('async');
var uuid = require('node-uuid');

var INDEX_FIELDS =
{
  users:
  {
    username: 'username',
    email: 'email',
    organization: 'organization',
    facebookId: 'social.facebook',
    twitterId: 'social.twitter',
    resetPasswordToken: 'resetPasswordToken'
  },
  facebook_accounts:
  {
    userId: 'userId',
    profileId: 'profile.id'
  },
  twitter_accounts:
  {
    userId: 'userId',
    profileId: 'profile.id'
  },
  admin_groups:
  {
    name: 'name'
  }
};

RiakDBAccessor.listBuckets = function(callback)
{
  riak._bucket.list(function(err, results)
  {
    callback(err, results);
  });
};

RiakDBAccessor.listBucket = function(bucket, callback)
{
  riak.bucket(bucket).objects.all(function(errs, r_objs)
  {
    if (errs)
      return callback(errs, null);

    var result = {};

    _(r_objs).each(function(r_obj)
    {
      result[r_obj.key] = r_obj.data;
    });

    callback(null, result);
  });
};

RiakDBAccessor.listKeysInBucket = function(bucket, callback)
{
  riak.bucket(bucket).objects.all(function(errs, r_objs)
  {
    callback(errs, _(r_objs).pluck('key'));
  });
};

RiakDBAccessor.listDocumentsInBucket = function(bucket, callback)
{
  riak.bucket(bucket).objects.all(function(errs, r_objs)
  {
    callback(errs, _(r_objs).pluck('data'));
  });
};

RiakDBAccessor.findOne = function(bucket, queryParams, callback)
{
  this.find(bucket, queryParams, function(error, result)
  {
    if (error)
      return callback(error);

    if (_.isArray(result))
    {
      if (result.length)
        callback(null, result[0]);
      else
        callback(null, null);
    }
    else
      callback(null, result);
  });
};

RiakDBAccessor.find = function(bucket, queryParams, callback)
{
  var key;

  if (typeof queryParams === 'string')
    key = queryParams;
  else if (_(queryParams).has('_id'))
    key = queryParams._id;

  if (key)
  {
    riak.bucket(bucket).objects.get(key, function(error, object)
    {
      if (error)
      {
        if (error.status_code === 404)
          return callback(null, []);

        return callback(error);
      }

      callback(null, [object.data]);
    });
  }
  else
  {
    var searchKey = _(queryParams).keys()[0];
    var searchValue = _(queryParams).values()[0];

    var compiled_results = [];
    riak.bucket(bucket).search.twoi(searchValue, searchKey).stream(function(results)
    {
      results.on('data', function(obj)
      {
        compiled_results.push(obj);
      });

      results.on('error', function(err)
      {
        callback(err);
      });

      results.on('end', function(continuation)
      {
        callback(null, _(compiled_results).pluck('data'));
      });
    });
  }
};

RiakDBAccessor.update = function(bucket, key, document, callback)
{
  var index = {};

  _(INDEX_FIELDS[bucket]).each(function(v, k)
  {
    if (v.indexOf('.') === -1)
      index[k] = document[v];
    else
    {
      var parts = v.split('.');
      index[k] = (document[parts[0]] && document[parts[0]][parts[1]]);
    }
  });

  var robj = riak.bucket(bucket).objects.new(key, document);
  _(index).each(function(v, k)
  {
    robj.addToIndex(k, v);
  });

  riak.bucket(bucket).objects.save(robj, function(errs, objs)
  {
    if (errs)
      return callback(errs);

    callback(null, objs.data);
  });
};

RiakDBAccessor.remove = function(bucket, key, callback)
{
  var self = this;

  if (typeof key === 'string')
  {
    var robj = riak.bucket(bucket).object.new(key, {});

    riak.bucket(bucket).objects.delete(robj, function(errs, objs)
    {
      callback(errs, objs);
    });
  }
  else if (typeof key === 'object')
  {
    this.findOne(bucket, key, function(error, doc)
    {
      if (error || !doc)
        return callback(error);

      self.remove(bucket, doc._id, callback);
    });
  }
};

RiakDBAccessor.findAndUpdate = function(bucket, queryParams, fieldsToSet, callback)
{
  var self = this;

  this.findOne(bucket, queryParams, function(error, object)
  {
    if (error || !object)
      return callback(error);

    _.extend(object, fieldsToSet);

    self.update(bucket, object._id, object, callback);
  });
};

RiakDBAccessor.deleteBucket = function(bucketName, callback)
{
  var self = this;

  function delete_key(bucket, key, callback)
  {
    self.remove(bucket, key, callback);
  }

  function delete_keys (err, keys)
  {
    var fetchFunctions = {};
    _(keys).each(function(key)
    {
      fetchFunctions[key] = delete_key.bind(null, bucketName, key);
    });

    if (_.size(fetchFunctions) > 0)
    {
      async.parallel(fetchFunctions, function(error, results)
      {
        callback(error);
      });
    }
    else
      callback(null);
  }

  this.listKeysInBucket(bucketName, delete_keys);
};

RiakDBAccessor.forEach = function(bucket, keyProperty, performFn, callback)
{
  var self = this;
  performFn = performFn || function(){};

  function updateFn(doc, callback)
  {
    self.update(bucket, doc[keyProperty], doc, function(error, doc)
    {
      callback(null, doc);
    });
  }

  self.listDocumentsInBucket(bucket, function(error, results)
  {
    if (error)
      return callback('error fetching');

    var fetchFunctions = {};
    _(results).each(function(doc, index)
    {
      performFn(doc);
      fetchFunctions[index] = updateFn.bind(null, doc);
    });

    if (_.size(fetchFunctions) > 0)
    {
      async.parallel(fetchFunctions, function(error, results)
      {
        return callback(error, results);
      });
    }
    else
      callback(null, null);
  });
};

