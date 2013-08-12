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
      id                : { type: String, unique: true },
      name              : { type: String, index: true },
      first_name        : { type: String, index: true },
      last_name         : { type: String, index: true },
      username          : { type: String },
      link              : { type: String },

      gender              : { type: String },
      email               : { type: String },
      timezone            : { type: Number },
      locale              : { type: String },
      verified            : { type: Boolean },

      location:
      {
        id                : { type: String },
        name              : { type: String }
      },

      homeTown:
      {
        id   : { type: String },
        name : { type: String }
      },

      likes: [LikesEntry]
    }
  });

  var LikesEntry = new mongoose.Schema({
    category     : String,
    name         : String,
    created_time : String,
    id           : String
  });

  facebookAccountSchema.plugin(pagedFind);
  facebookAccountSchema.index({ search: 1 });

  app.db.model('FacebookAccount', facebookAccountSchema, 'facebookAccounts');
};

/*
var foo =
{
  "provider": "facebook",
  "id": "611947174",
  "username": "satish.bhatti.522", // from _json.link
  "displayName": "Satish Bhatti", // _json.name

  "name": {
    "familyName": "Bhatti",  // _json.last_name
    "givenName": "Satish"    // _json.first_name
  },

  "gender": "male",
  "profileUrl": "https://www.facebook.com/satish.bhatti.522",  // _json.link
  "emails": [{
      "value": "extropy@gmail.com"
    }
  ],

  "_json":
  {
    "id": "611947174",
    "name": "Satish Bhatti",
    "first_name": "Satish",
    "last_name": "Bhatti",
    "link": "https://www.facebook.com/satish.bhatti.522",
    "username": "satish.bhatti.522",

    "location":
    {
      "id": "114952118516947",
      "name": "San Francisco, California"
    },

    "gender": "male",
    "email": "extropy@gmail.com",
    "timezone": -7,
    "locale": "en_US",
    "verified": true,
    "updated_time": "2012-09-15T12:03:04+0000"
  }
};
*/
