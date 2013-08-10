exports = module.exports = function(app, mongoose)
{
  var pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var accountSchema = new mongoose.Schema(
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
      last: { type: String, default: '' }
    },

    company: { type: String, default: '' },
    phone: { type: String, default: '' },
    zip: { type: String, default: '' },

    createdBy:
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, default: '' },
      time: { type: Date, default: Date.now }
    },

    search: [String]
  });

  accountSchema.plugin(pagedFind);
//  accountSchema.index({ user: 1 });
  accountSchema.index({ 'user.id': 1 });
  accountSchema.index({ search: 1 });
//  accountSchema.set('autoIndex', (app.get('env') == 'development'));

  app.db.model('Account', accountSchema, 'accounts');
}
