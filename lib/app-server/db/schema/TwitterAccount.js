exports = module.exports = function(app, mongoose)
{
  var crypto = require('crypto'),
      pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var twitterAccountSchema = new mongoose.Schema(
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
      followers_count   : { type: Number },
      created_at        : { type: String } // "Tue Dec 09 23:03:45 +0000 2008"
    }
  });

  twitterAccountSchema.plugin(pagedFind);
  twitterAccountSchema.index({ search: 1 });

  app.db.model('TwitterAccount', twitterAccountSchema, 'twitterAccounts');
};

/*
var foo =
{
  "provider": "twitter",
  "id": 18005542,             // _json.id
  "username": "aleph2012",    // _json.screen_name
  "displayName": "aleph2012", // _json.name

  "photos": [{
      "value": "https://si0.twimg.com/profile_images/2967952107/90942306b9461798266d280bec52d132_normal.jpeg"  // _json.profile_image_url_https
    }
  ],

  "_json":
  {
    "id": 18005542,
    "id_str": "18005542",
    "name": "aleph2012",
    "screen_name": "aleph2012",
    "location": "",
    "description": "",
    "url": null,

    "entities":
    {
      "description": {
        "urls": []
      }
    },

    "protected": false,
    "followers_count": 15,
    "friends_count": 30,
    "listed_count": 2,
    "created_at": "Tue Dec 09 23:03:45 +0000 2008",
    "favourites_count": 7,
    "utc_offset": null,
    "time_zone": null,
    "geo_enabled": false,
    "verified": false,
    "statuses_count": 134,
    "lang": "en",

    "status":
    {
      "created_at": "Tue Jul 30 20:44:49 +0000 2013",
      "id": 362312850171117600,
      "id_str": "362312850171117569",
      "text": "@zang0 I love the image this conjures up! :)",
      "source": "web",
      "truncated": false,
      "in_reply_to_status_id": 361636982742450200,
      "in_reply_to_status_id_str": "361636982742450176",
      "in_reply_to_user_id": 7114622,
      "in_reply_to_user_id_str": "7114622",
      "in_reply_to_screen_name": "zang0",
      "geo": null,
      "coordinates": null,
      "place": null,
      "contributors": null,
      "retweet_count": 0,
      "favorite_count": 0,
      "entities": {
        "hashtags": [],
        "symbols": [],
        "urls": [],
        "user_mentions": [{
            "screen_name": "zang0",
            "name": "Deep Dhillon",
            "id": 7114622,
            "id_str": "7114622",
            "indices": [0, 6]
          }
        ]
      },
      "favorited": false,
      "retweeted": false,
      "lang": "en"
    },

    "contributors_enabled": false,
    "is_translator": false,
    "profile_background_color": "C0DEED",
    "profile_background_image_url": "http://a0.twimg.com/images/themes/theme1/bg.png",
    "profile_background_image_url_https": "https://si0.twimg.com/images/themes/theme1/bg.png",
    "profile_background_tile": false,
    "profile_image_url": "http://a0.twimg.com/profile_images/2967952107/90942306b9461798266d280bec52d132_normal.jpeg",
    "profile_image_url_https": "https://si0.twimg.com/profile_images/2967952107/90942306b9461798266d280bec52d132_normal.jpeg",
    "profile_link_color": "0084B4",
    "profile_sidebar_border_color": "C0DEED",
    "profile_sidebar_fill_color": "DDEEF6",
    "profile_text_color": "333333",
    "profile_use_background_image": true,
    "default_profile": true,
    "default_profile_image": false,
    "following": false,
    "follow_request_sent": false,
    "notifications": false
  }
};
*/
