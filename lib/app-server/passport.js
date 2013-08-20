exports = module.exports = function(app, passport)
{
  var LocalStrategy = require('passport-local').Strategy,
      TwitterStrategy = require('passport-twitter').Strategy,
      GitHubStrategy = require('passport-github').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy,
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
      SinglyStrategy = require('passport-singly').Strategy;

  // Local
  passport.use(new LocalStrategy(function(username, password, done)
  {
    // Lookup conditions
    var conditions = { isActive: 'yes' };

    if (username.indexOf('@') === -1)
      conditions.username = username;
    else
      conditions.email = username;

    app.db.models.User.findOne(conditions, function(error, user)
    {
      if (error)
        return done(error);

      if (!user)
        return done(null, false, { message: 'Unknown user' });

      // Validate password
      var encryptedPassword = app.db.models.User.encryptPassword(password);

      if (user.password != encryptedPassword)
        return done(null, false, { message: 'Invalid password' });

      // We're good
      return done(null, user);
    });
  }));

  // Twitter
  if (app.get('twitter-oauth-key'))
  {
    passport.use(new TwitterStrategy({ consumerKey: app.get('twitter-oauth-key'), consumerSecret: app.get('twitter-oauth-secret') },

    function(token, tokenSecret, profile, done)
    {
      // Hand off to caller
      done(null, false,
      {
        token: token,
        tokenSecret: tokenSecret,
        profile: profile
      });
    }));
  }

  // Github
  if (app.get('github-oauth-key'))
  {
    var githubOptions =
    {
      clientID: app.get('github-oauth-key'),
      clientSecret: app.get('github-oauth-secret'),

      customHeaders:
      {
        "User-Agent": app.get('project-name')
      }
    };

    passport.use(new GitHubStrategy(githubOptions, function(accessToken, refreshToken, profile, done)
    {
      //hand off to caller
      done(null, false,
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }));
  }

  // Facebook
  if (app.get('facebook-oauth-key'))
  {
    passport.use(new FacebookStrategy(
    {
      clientID: app.get('facebook-oauth-key'),
      clientSecret: app.get('facebook-oauth-secret')
    },

    function(accessToken, refreshToken, profile, done)
    {
      // Hand off to caller
      done(null, false,
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }));
  }

  // Google
  if (app.get('google-oauth-key'))
  {
    passport.use(new GoogleStrategy(
    {
      clientID: app.get('google-client-id'),
      clientSecret: app.get('google-client-secret')
    },

    function(accessToken, refreshToken, profile, done)
    {
      // Hand off to caller
      done(null, false,
      {
        accessToken: accessToken,
        refreshToken: refreshToken,
        profile: profile
      });
    }));
  }

  // Singly
  if (app.get('singly-app-id'))
  {
    passport.use(new SinglyStrategy(
    {
      clientID: app.get('singly-app-id'),
      clientSecret: app.get('singly-app-secret'),
      authorizationURL: 'https://api.singly.com/oauth/authenticate'
    },

    function(accessToken, refreshToken, profile, done)
    {
      // asynchronous verification, for effect...
      process.nextTick(function()
      {
        // To keep the example simple, the user's Singly profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the Singly account with a user record in your database,
        // and return that user instead.
        console.log(accessToken, refreshToken, profile);
        done(null, false,
        {
          accessToken: accessToken,
          refreshToken: refreshToken,
          profile: profile
        });

        //        return done(null, profile);
      });
    }));
  }

  // Serialize
  passport.serializeUser(function(user, done)
  {
    done(null, user._id);
  });

  // Deserialize
  passport.deserializeUser(function(id, done)
  {
    app.db.models.User.findOne({ _id: id }).populate('roles.admin').populate('roles.account').exec(function(error, user)
    {
      if (error)
        return done(error);

      if (!user)
        return done(null, false, { message: 'Unknown user' });

      if (user.roles && user.roles.admin)
      {
        user.roles.admin.populate("groups", function(error, admin)
        {
          done(error, user);
        });
      }
      else
        done(error, user);
    });
  });
};
