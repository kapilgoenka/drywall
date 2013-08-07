exports = module.exports = function(app, mongoose)
{
  var pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var adminSchema = new mongoose.Schema(
  {
    user:
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' }
    },

    name:
    {
      full: { type: String, default: '' },
      first: { type: String, default: '' },
      middle: { type: String, default: '' },
      last: { type: String, default: '' },
    },

    groups: [{ type: String, ref: 'AdminGroup' }],

    permissions: [{ name: String, permit: Boolean }],

    timeCreated: { type: Date, default: Date.now },
    search: [String]
  });

  adminSchema.methods.checkGroupPermission = function(something)
  {
    for (var i = 0, numGroups = this.groups.length; i < numGroups; i++)
    {
      var group = this.groups[i];

      for (var j = 0, numPermissions = group.permissions.length; j < numPermissions; j++)
      {
        var permission = group.permissions[j];

        if (permission.permit && permission.name === something)
            return true;
      }
    }

    return false;
  };

  adminSchema.methods.hasPermissionTo = function(something)
  {
    // Check admin permissions.
    for (var i = 0, numPermissions = this.permissions.length; i < numPermissions; i++)
    {
      var permission = this.permissions[i];

      if (permission.name == something)
      {
        if (permission.permit)
          return true;

        return false;
      }
    }

    // Check group permissions.
    return this.checkGroupPermission(something);
  };

  adminSchema.methods.isMemberOf = function(group)
  {
    for (var i = 0, numGroups = this.groups.length; i < numGroups; i++)
    {
      if (this.groups[i]._id === group)
        return true;
    }

    return false;
  };

  adminSchema.plugin(pagedFind);
  adminSchema.index({ 'user.id': 1 });
  adminSchema.index({ search: 1 });
//  adminSchema.set('autoIndex', (app.get('env') == 'development'));

  app.db.model('Admin', adminSchema, 'admins');
}
