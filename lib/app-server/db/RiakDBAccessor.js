var RiakDBAccessor = module.exports;
var Config = require('app-server/config');
var riak = require('riak-js').getClient({ host: Config.riak.host, port: Config.riak.port });
var _ = require('underscore');
var uuid = require('node-uuid');

var INDEX_FIELDS =
{
  users:
  {
    username: 'username',
    email: 'email',
    facebookId: 'social.facebook',
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

RiakDBAccessor.populate = function(document, populateQuery, callback)
{
  var self = this;

  this.findOne(populateQuery.bucket, populateQuery.key, function(error, record)
  {
    if (error)
      return callback(error);

    _.extend(document, record);
    callback(null, document);
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
  var key = undefined;

  if (typeof queryParams === 'string')
    key = queryParams;
  else if (_(queryParams).has('_id'))
    key = queryParams._id;

  if (key)
  {
    riak.get(bucket, key, function(error, object)
    {
      if (error)
      {
        if (error.notFound)
          return callback(null, []);

        return callback(error);
      }

      callback(null, object['props'] ? [] : object);
    });
  }
  else
  {
    var searchKey = _(queryParams).keys()[0];
    var searchValue = _(queryParams).values()[0];

    riak.mapreduce.add(
    {
      bucket: bucket,
      index: searchKey + '_bin',
      key: searchValue
    })
    .map('Riak.mapValuesJson')
    .run(function(error, matches)
    {
      if (error)
        return callback(error);

      callback(null, matches);
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

  riak.save(bucket, key, document,
  {
    index: index,
    returnbody: true
  }, function(error, object, meta)
  {
    if (error)
      return callback(error);

    callback(null, object);
  });
};

RiakDBAccessor.findAll = function(bucket, callback)
{
  riak.mapreduce.add(bucket)
  .map('Riak.mapValuesJson')
  .run(function(error, matches)
  {
    if (error)
      return callback(error);

    if (callback)
      callback(null, matches);
  });
};

RiakDBAccessor.remove = function(bucket, key, callback)
{
  var self = this;

  if (typeof key === 'string')
  {
    riak.remove(bucket, key, function(error)
    {
      if (error)
        return callback(error);

      if (callback)
        callback(null);
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

RiakDBAccessor.insertRootUser = function(callback)
{
  var data = {
    _id: uuid.v4(),
    username: 'root',
    isActive: 'yes',
    email: 'kapil@sportstream.com',
    password: require('app').app.encryptPassword('1234'),
    accounts: { admin: 'rootAdmin' }
  };

  this.update('users', data._id, data, function(error, user)
  {
    if (error)
      return callback(error);

    console.log('root user created');
    callback(null, user);
  });
};

RiakDBAccessor.insertRootAdmin = function(user, callback)
{
  var data = {
    _id: 'rootAdmin',
    name: {
      first: 'Root',
      last: 'Admin',
      full: 'Root Admin'
    },
    user: {
      id: user._id,
      name: user.username
    },
    groups: ['root']
  };

  this.update('admins', data._id, data, function(error, admin)
  {
    if (error)
      return callback(error);

    console.log('root admin created');
    callback(null, admin);
  });
};

RiakDBAccessor.insertRootGroup = function(callback)
{
  var groupData = {
    _id: 'root',
    name: 'Root',
    permissions: []
  };

  this.update('admin_groups', groupData._id, groupData, function(error, group)
  {
    if (error)
      return callback(error);

    console.log('admin group created');
    callback(null, group);
  })
};

RiakDBAccessor.deleteBucket = function(bucketName)
{
  var delete_key = function(bucket, key)
  {
    riak.remove(bucket, key);
  }

  var delete_keys = function(err, keys)
  {
    keys.forEach(function(key)
    {
      delete_key(bucketname, key);
    });
  }

  db.keys(bucketname, delete_keys);
};

