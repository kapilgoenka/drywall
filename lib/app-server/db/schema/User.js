exports = module.exports = function(app, mongoose)
{
  var crypto = require('crypto'),
      pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    password: String,
    email: { type: String, unique: true },

    roles:
    {
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    },

    isActive: String,
    timeCreated: { type: Date, default: Date.now },
    resetPasswordToken: String,
    twitter: {},
    github: {},
    facebook: {},
    search: [String]
  });

  userSchema.methods.getSocialId = function(socialType)
  {
    return this.get(socialType + '.id');
  };

  userSchema.methods.canPlayRoleOf = function(role)
  {
    return !!this.roles[role];
  };

  userSchema.methods.defaultReturnUrl = function()
  {
    var returnUrl = '/';

    if (this.canPlayRoleOf('account'))
      returnUrl = '/account/';

    if (this.canPlayRoleOf('admin'))
      returnUrl = '/admin/';

    return returnUrl;
  };

  userSchema.statics.encryptPassword = function(password)
  {
    return crypto.createHmac('sha512', app.get('crypto-key')).update(password).digest('hex');
  };

  userSchema.plugin(pagedFind);
//  userSchema.index({ username: 1 }, {unique: true});
//  userSchema.index({ email: 1 });
  userSchema.index({ timeCreated: 1 });
  userSchema.index({ resetPasswordToken: 1 });
  userSchema.index({ 'twitter.id': 1 });
  userSchema.index({ 'github.id': 1 });
  userSchema.index({ 'facebook.id': 1 });
  userSchema.index({ search: 1 });
//  userSchema.set('autoIndex', (app.get('env') == 'development'));

  app.db.model('User', userSchema, 'users');
};
