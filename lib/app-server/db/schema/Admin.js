exports = module.exports = function(app, mongoose)
{
  var pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var adminSchema = new mongoose.Schema({
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

    permissions: [{
      name: String,
      permit: Boolean
    }],

    timeCreated: { type: Date, default: Date.now },
    search: [String]
  });

  adminSchema.methods.checkGroupPermission = function(something)
  {
    for (var i = 0 ; i < this.groups.length ; i++)
    {
      for (var j = 0 ; j < this.groups[i].permissions.length ; j++)
      {
        if (this.groups[i].permissions[j].name == something)
        {
          if (this.groups[i].permissions[j].permit)
            return true;
        }
      }
    }

    return false;
  };

  adminSchema.methods.hasPermissionTo = function(something)
  {
    // Check admin permissions.
    for (var i = 0 ; i < this.permissions.length ; i++)
    {
      if (this.permissions[i].name == something)
      {
        if (this.permissions[i].permit)
          return true;

        return false;
      }
    }

    // Check group permissions.
    return this.checkGroupPermission(something);
  };

  adminSchema.methods.isMemberOf = function(group)
  {
    for (var i = 0 ; i < this.groups.length ; i++)
    {
      if (this.groups[i]._id == group)
        return true;
    }

    return false;
  };

  adminSchema.plugin(pagedFind);
  adminSchema.index({ 'user.id': 1 });
  adminSchema.index({ search: 1 });
  adminSchema.set('autoIndex', (app.get('env') == 'development'));

  app.db.model('Admin', adminSchema);
}
