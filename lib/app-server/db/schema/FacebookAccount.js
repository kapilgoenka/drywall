exports = module.exports = function(app, mongoose)
{
  var crypto = require('crypto'),
      pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var facebookAccountSchema = new mongoose.Schema(
  {
    userId              : { type: mongoose.Schema.Types.ObjectId/*, ref: 'User'*/ },
    search              : [String],

    profile:
    {
      id                : { type: Number, unique: true },
      id_str            : { type: String, unique: true },
      name              : { type: String, index: true },
      screen_name       : { type: String, index: true },
      verified          : { type: Boolean, index: true },
      lang              : { type: String },
      friends_count     : { type: Number },
      followers_count   : { type: Number }
    }
  });

  facebookAccountSchema.plugin(pagedFind);
  facebookAccountSchema.index({ search: 1 });

  app.db.model('FacebookAccount', facebookAccountSchema, 'facebookAccounts');
};
