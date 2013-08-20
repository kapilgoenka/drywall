exports = module.exports = function(app, mongoose)
{
  var crypto = require('crypto'),
      pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var googleAccountSchema = new mongoose.Schema(
  {
    userId              : { type: mongoose.Schema.Types.ObjectId/*, ref: 'User'*/ },
    search              : [String],

    profile:
    {
      id                  : { type: String, unique: true },
      name                : { type: String, index: true },
      given_name          : { type: String, index: true },
      family_name         : { type: String, index: true },
      link                : { type: String },

      gender              : { type: String },
      email               : { type: String },
      locale              : { type: String },
      verified_email      : { type: Boolean }
    }
  });

  googleAccountSchema.plugin(pagedFind);
  googleAccountSchema.index({ search: 1 });

  app.db.model('GoogleAccount', googleAccountSchema, 'googleAccounts');
};

/*
var foo =
{
  provider: "google",
  id: "114391423441149370944",
  displayName: "ender wiggin",

  name:
  {
    familyName: "wiggin",
    givenName: "ender"
  }

  emails: [{ value: "extropy@gmail.com" }],

  _json:
  {
    id: "114391423441149370944",
    name: "ender wiggin",
    given_name: "ender",
    family_name: "wiggin",
    link: "https://plus.google.com/114391423441149370944",
    gender: "male",
    email: "extropy@gmail.com",
    locale: "en",
    verified_email: true
  }
};
*/
