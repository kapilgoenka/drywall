var AdminUtil = module.exports;
var uuid = require('node-uuid');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

/*******************************************************************************
 * createRootUserIfNeeded
 *******************************************************************************
 * Create an admin user with username 'root' if one doesn't already exist
 * The root admin is the first admin in the system as is the one that creates any new admin
 * This is only called once during application bootstrap
 *
 * Inputs:
 *   callback:
 */
AdminUtil.createRootUserIfNeeded = function(callback)
{
  RiakDBAccessor.findOne('users', { username: 'root' }, function(error, user)
  {
    if (error)
      return callback(error);

    if (user)
      return callback(null, user);

    AdminUtil.insertRootUser(function(error, rootUser)
    {
      if (error)
        return callback(error);

      AdminUtil.insertRootGroup(function(error, group)
      {
        if (error)
          return callback(error);

        AdminUtil.makeAdmin(rootUser, function(error, result)
        {
          if (error)
            return callback(error);

          callback(null, result);
        });
      });
    });
  });
};

AdminUtil.insertRootUser = function(callback)
{
  var data =
  {
    _id: uuid.v4(),
    isActive: 'yes',
    username: 'root',
    displayName: 'root',
    organization: 'FB_Employees',
    email: 'kapil@sportstream.com',
    password: require('app').app.encryptPassword('evriONE88')
  };

  RiakDBAccessor.update('users', data._id, data, function(error, user)
  {
    callback(error, user);
  });
};

AdminUtil.insertRootGroup = function(callback)
{
  var data =
  {
    _id: 'root',
    name: 'Root',
    permissions: []
  };

  RiakDBAccessor.update('admin_groups', data._id, data, function(error, group)
  {
    callback(error, group);
  });
};

AdminUtil.makeAdmin = function(user, callback)
{
  var self = this;

  var data =
  {
    _id: uuid.v4(),
    name: {
      first: user.firstName,
      last: user.lastName,
      full: user.displayName
    },
    user: {
      id: user._id
    },
    groups: ['root']
  };

  RiakDBAccessor.update('admins', data._id, data, function(error, admin)
  {
    if (error)
      return callback(error);

    user.accounts = user.accounts || {};
    user.accounts.admin = admin._id;

    RiakDBAccessor.update('users', user._id, user, function(error, user)
    {
      return callback(error, user);
    });
  });
};