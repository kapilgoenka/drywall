var App = require('app').app;
var _ = require('underscore');
var jwt = require('jwt-simple');
var uuid = require('node-uuid');
var SignupUtil = require('app-server/signup/SignupUtil');
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');
var FACEBOOK_APP_PERMISSIONS = ['read_stream, publish_actions, user_hometown, user_location, user_likes, email, publish_stream'];
var GOOGLE_SCOPE = ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'];

function ensureAuthenticated(req, res, next)
{
  if (req.xhr)
  {
    var authToken = req.headers['x-authtoken'];
    var decodedAuthToken = jwt.decode(authToken, App.get('JWT_TOKEN_SECRET'));
    var userId = decodedAuthToken._id;

    RiakDBAccessor.findOne('users', userId, function(error, user)
    {
      if (error || !user)
        return res.send(401, 'Not Authenticated');

      req.user = user;
      next();
    });
  }
  else
  {
    if (req.isAuthenticated())
      return next();

    res.set('X-Auth-Required', 'true');
    res.redirect('/login/?returnUrl='+ encodeURIComponent(req.originalUrl));
  }
}

function ensureAdmin(req, res, next)
{
  if (App.canPlayRoleOf(req.user, 'admin'))
      return next();

  if (req.xhr)
    res.send(400, 'Not an admin');
  else
    res.redirect('/');
}

exports = module.exports = function(app, passport)
{
  //front end
  app.get('/', require('views/index').init);

  //sign up
  app.get('/signup/', require('views/signup/index').init);
  app.post('/signup/', require('views/signup/index').signup);

  //social sign up
  app.post('/signup/social/', require('views/signup/index').signupSocial);

  app.get('/signup/facebook/', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: FACEBOOK_APP_PERMISSIONS }));
  app.get('/signup/facebook/callback/', require('views/signup/index').signupFacebook);

  app.get('/signup/twitter/', passport.authenticate('twitter', { callbackURL: '/signup/twitter/callback/' }));
  app.get('/signup/twitter/callback/', require('views/signup/index').signupTwitter);

  app.get('/signup/google/', passport.authenticate('google', { callbackURL: '/signup/google/callback/', scope: GOOGLE_SCOPE }));
  app.get('/signup/google/callback/', require('views/signup/index').signupGoogle);

  app.get('/signup/github/', passport.authenticate('github', { callbackURL: '/signup/github/callback/' }));
  app.get('/signup/github/callback/', require('views/signup/index').signupGitHub);

  //login/out
  app.get('/login/', require('views/login/index').init);
  app.post('/login/', require('views/login/index').login);
  app.get('/login/forgot/', require('views/login/forgot/index').init);
  app.post('/login/forgot/', require('views/login/forgot/index').send);
  app.get('/login/reset/', require('views/login/reset/index').init);
  app.get('/login/reset/:token/', require('views/login/reset/index').init);
  app.put('/login/reset/:token/', require('views/login/reset/index').set);
  app.post('/isLoggedIn/', require('views/login/index').isLoggedIn);
  app.get('/logout*', ensureAuthenticated);
  app.get('/logout/', require('views/logout/index').init);

  // Social login

  app.get('/login/facebook/', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
  app.get('/login/facebook/callback/', require('views/login/index').loginFacebook);
  app.post('/login/facebook/callback/', require('views/login/index').loginFacebook);

  app.get('/login/twitter/', passport.authenticate('twitter', { callbackURL: '/login/twitter/callback/' }));
  app.get('/login/twitter/callback/', require('views/login/index').loginTwitter);

  app.get('/login/google/', passport.authenticate('google', { callbackURL: '/login/google/callback/', scope: GOOGLE_SCOPE }));
  app.get('/login/google/callback/', require('views/login/index').loginGoogle);

  app.get('/login/github/', passport.authenticate('github', { callbackURL: '/login/github/callback/' }));
  app.get('/login/github/callback/', require('views/login/index').loginGitHub);

  app.get('/auth/singly/:service', passport.authenticate('singly', { callbackURL: '/auth/singly/callback/' }));
  app.get('/auth/singly/callback/', require('views/login/index').loginSingly);

  // Admin
  app.all('/admin*', ensureAuthenticated);
  app.all('/admin*', ensureAdmin);
  app.get('/admin/', require('views/admin/index').init);

  //admin > users
  app.get('/admin/users/', require('views/admin/users/index').find);
  app.get('/admin/organizations/', require('views/admin/organizations/index').list);
  app.get('/admin/organizations/:name/', require('views/admin/organizations/index').read);
  app.get('/admin/organizations/:name/:event/', require('lib/app-server/admin/EventAdmin').read);
  app.get('/admin/events/', require('lib/app-server/admin/EventAdmin').list);
  app.get('/admin/events/:event/', require('lib/app-server/admin/EventAdmin').read);
  app.post('/admin/events/:eventName/', require('lib/app-server/admin/EventAdmin').update);

  app.get('/admin/twitter/', require('views/admin/twitter/index').find);
  app.get('/admin/twitter/:id/', require('views/admin/twitter/index').read);

  app.get('/admin/facebook/', require('views/admin/facebook/index').find);
  app.get('/admin/facebook/:id/', require('views/admin/facebook/index').read);

  app.get('/admin/google/', require('views/admin/google/index').find);
  app.get('/admin/google/:id/', require('views/admin/google/index').read);

  app.post('/admin/users/', require('views/admin/users/index').create);
  app.get('/admin/users/:id/', require('views/admin/users/index').read);
  app.put('/admin/users/:id/', require('views/admin/users/index').update);
  app.put('/admin/users/:id/password/', require('views/admin/users/index').password);
  app.put('/admin/users/:id/role-admin/', require('views/admin/users/index').linkAdmin);
  app.delete('/admin/users/:id/role-admin/', require('views/admin/users/index').unlinkAdmin);
  app.put('/admin/users/:id/role-account/', require('views/admin/users/index').linkAccount);
  app.delete('/admin/users/:id/role-account/', require('views/admin/users/index').unlinkAccount);
  app.delete('/admin/users/:id/', require('views/admin/users/index').deleteUser);

  app.delete('/admin/users/:id/:socialType/', require('views/admin/users/index').disconnectSocial);

  //admin > administrators
  app.get('/admin/administrators/', require('views/admin/administrators/index').find);
  app.post('/admin/administrators/', require('views/admin/administrators/index').create);
  app.get('/admin/administrators/:id/', require('views/admin/administrators/index').read);
  app.put('/admin/administrators/:id/', require('views/admin/administrators/index').update);
  app.put('/admin/administrators/:id/permissions/', require('views/admin/administrators/index').permissions);
  app.put('/admin/administrators/:id/groups/', require('views/admin/administrators/index').groups);
  app.put('/admin/administrators/:id/user/', require('views/admin/administrators/index').linkUser);
  app.delete('/admin/administrators/:id/user/', require('views/admin/administrators/index').unlinkUser);
  app.delete('/admin/administrators/:id/', require('views/admin/administrators/index').deleteAdmin);

  //admin > admin groups
  app.get('/admin/admin-groups/', require('views/admin/admin-groups/index').find);
  app.post('/admin/admin-groups/', require('views/admin/admin-groups/index').create);
  app.get('/admin/admin-groups/:id/', require('views/admin/admin-groups/index').read);
  app.put('/admin/admin-groups/:id/', require('views/admin/admin-groups/index').update);
  app.put('/admin/admin-groups/:id/permissions/', require('views/admin/admin-groups/index').permissions);
  app.delete('/admin/admin-groups/:id/', require('views/admin/admin-groups/index').deleteGroup);

  //admin > accounts
  app.get('/admin/accounts/', require('views/admin/accounts/index').find);
  app.post('/admin/accounts/', require('views/admin/accounts/index').create);
  app.get('/admin/accounts/:id/', require('views/admin/accounts/index').read);
  app.put('/admin/accounts/:id/', require('views/admin/accounts/index').update);
  app.put('/admin/accounts/:id/user/', require('views/admin/accounts/index').linkUser);
  app.delete('/admin/accounts/:id/user/', require('views/admin/accounts/index').unlinkUser);
  app.delete('/admin/accounts/:id/', require('views/admin/accounts/index').deleteAccount);

  //admin > search
  app.get('/admin/search/', require('views/admin/search/index').find);

  //account
  // app.all('/account*', ensureAuthenticated);
  app.get('/account/', require('views/account/index').init);

  //account > settings
  app.get('/account/settings/', require('views/account/settings/index').init);
  app.post('/account/settings/', require('views/account/settings/index').update);
  app.put('/account/settings/identity/', require('views/account/settings/index').identity);
  app.put('/account/settings/password/', require('views/account/settings/index').password);

  //account > settings > social
  app.get('/account/settings/twitter/', passport.authenticate('twitter', { callbackURL: '/account/settings/twitter/callback/' }));
  app.get('/account/settings/twitter/callback/', require('views/account/settings/index').connectTwitter);
  app.get('/account/settings/twitter/disconnect/', require('views/account/settings/index').disconnectTwitter);

  app.get('/account/settings/github/', passport.authenticate('github', { callbackURL: '/account/settings/github/callback/' }));
  app.get('/account/settings/github/callback/', require('views/account/settings/index').connectGitHub);
  app.get('/account/settings/github/disconnect/', require('views/account/settings/index').disconnectGitHub);

  app.get('/account/settings/facebook/', passport.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }));
  app.get('/account/settings/facebook/callback/', require('views/account/settings/index').connectFacebook);
  app.get('/account/settings/facebook/disconnect/', require('views/account/settings/index').disconnectFacebook);

  app.get('/account/settings/google/', passport.authenticate('google', { callbackURL: '/account/settings/google/callback/', scope: GOOGLE_SCOPE }));
  app.get('/account/settings/google/callback/', require('views/account/settings/index').connectGoogle);
  app.get('/account/settings/google/disconnect/', require('views/account/settings/index').disconnectGoogle);

  app.all('/media-curation*', ensureAuthenticated);
  app.get('/media-curation/savedQueries', require('lib/app-server/MediaCuration').getSavedQueries);
  app.post('/media-curation/savedQueries', require('lib/app-server/MediaCuration').updateSavedQueries);
  app.get('/media-curation/savedResults', require('lib/app-server/MediaCuration').getSavedResults);
  app.post('/media-curation/savedResults', require('lib/app-server/MediaCuration').updateSavedResults);
  app.get('/media-curation/:eventName/:property', require('lib/app-server/MediaCuration').getEventProperty);
  app.get('/media-curation/:eventName', require('lib/app-server/MediaCuration').getEventConfigAndData);

  app.post('/updateOrgs', require('lib/app-server/OrgUpdater').updateOrgs);

  //route not found
  app.all('*', require('views/http/index').http404);
}
