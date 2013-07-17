/*******************************************************************************
 * init()
 *******************************************************************************
 * Initialize user account creation.
 *
 * Inputs:
 *   request:
 *
 *   response:
 */
exports.init = function(request, response)
{
  // Are we logged in?
  if (request.isAuthenticated())
  {
    response.redirect(request.user.defaultReturnUrl());
  }
  else
  {
    response.render('signup/index',
    {
      oauthMessage: '',
      oauthTwitter: !!request.app.get('twitter-oauth-key'),
      oauthGitHub: !!request.app.get('github-oauth-key'),
      oauthFacebook: !!request.app.get('facebook-oauth-key')
    });
  }
};

/*******************************************************************************
 * signup()
 *******************************************************************************
 * Create a new user account with username/password.
 *
 * Inputs:
 *   request:
 *
 *   response:
 */
exports.signup = function(request, response)
{
  var workflow = new request.app.utility.Workflow(request, response);

  workflow.on('validate', function()
  {
    if (!request.body.username)
      workflow.outcome.errfor.username = 'required';
    else if (!/^[a-zA-Z0-9\-\_]+$/.test(request.body.username))
      workflow.outcome.errfor.username = 'only use letters, numbers, \'-\', \'_\'';
    if (!request.body.email)
      workflow.outcome.errfor.email = 'required';
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(request.body.email))
      workflow.outcome.errfor.email = 'invalid email format';

    if (!request.body.password)
      workflow.outcome.errfor.password = 'required';

    //return if we have errors already
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('duplicateUsernameCheck');
  });

  // Check for user name already in use.
  workflow.on('duplicateUsernameCheck', function()
  {
    request.app.db.models.User.findOne({ username: request.body.username }, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      if (user)
      {
        workflow.outcome.errfor.username = 'username already taken';
        return workflow.emit('response');
      }

      workflow.emit('duplicateEmailCheck');
    });
  });

  // Check for email already in use.
  workflow.on('duplicateEmailCheck', function()
  {
    request.app.db.models.User.findOne({ email: request.body.email }, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      if (user)
      {
        workflow.outcome.errfor.email = 'email already registered';
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  // Create the user record.
  workflow.on('createUser', function()
  {
    var fieldsToSet =
    {
      isActive: 'yes',
      username: request.body.username,
      email: request.body.email,
      password: request.app.db.models.User.encryptPassword(request.body.password),
      search: [
        request.body.username,
        request.body.email
      ]
    };

    request.app.db.models.User.create(fieldsToSet, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      workflow.user = user;
      workflow.emit('createAccount');
    });
  });

  // Create an account record linked to the user record.
  workflow.on('createAccount', function()
  {
    var fieldsToSet =
    {
      'name.full': workflow.user.username,
      user:
      {
        id: workflow.user._id,
        name: workflow.user.username
      },
      search: [
        workflow.user.username
      ]
    };

    request.app.db.models.Account.create(fieldsToSet, function(err, account)
    {
      if (err)
        return workflow.emit('exception', err);

      // Update user with account
      workflow.user.roles.account = account._id;

      workflow.user.save(function(err, user)
      {
        if (err)
          return workflow.emit('exception', err);

        workflow.emit('sendWelcomeEmail');
      });
    });
  });

  // Send a welcome email.
  workflow.on('sendWelcomeEmail', function()
  {
    request.app.utility.email(request, response,
    {
      from: request.app.get('email-from-name') +' <'+ request.app.get('email-from-address') +'>',
      to: request.body.email,
      subject: 'Your '+ request.app.get('project-name') +' Account',
      textPath: 'signup/email-text',
      htmlPath: 'signup/email-html',

      locals:
      {
        username: request.body.username,
        email: request.body.email,
        loginURL: 'http://'+ request.headers.host +'/login/',
        projectName: request.app.get('project-name')
      },

      success: function(message)
      {
        workflow.emit('logUserIn');
      },

      error: function(err)
      {
        console.log('Error Sending Welcome Email: '+ err);
        workflow.emit('logUserIn');
      }
    });
  });

  // Automatically log the new user in.
  workflow.on('logUserIn', function()
  {
    request._passport.instance.authenticate('local', function(err, user, info)
    {
      if (err)
        return workflow.emit('exception', err);

      if (!user)
      {
        workflow.outcome.errors.push('Login failed. That is strange.');
        return workflow.emit('response');
      }
      else
      {
        request.login(user, function(err)
        {
          if (err)
            return workflow.emit('exception', err);

          workflow.outcome.defaultReturnUrl = user.defaultReturnUrl();
          workflow.emit('response');
        });
      }
    })(request, response);
  });

  // Kick off the workflow processing.
  workflow.emit('validate');
};

/*******************************************************************************
 * signupTwitter()
 *******************************************************************************
 * Create a new user account via Twitter auth.
 *
 * Inputs:
 *   request:
 *
 *   response:
 *
 *   next:
 */
exports.signupTwitter = function(request, response, next)
{
  request._passport.instance.authenticate('twitter', function(err, user, info)
  {
    if (!info || !info.profile)
      return response.redirect('/signup/');

    request.app.db.models.User.findOne({ 'twitter.id': info.profile.id }, function(err, user)
    {
      if (err)
        return next(err);

      if (!user)
      {
        request.session.socialProfile = info.profile;
        response.render('signup/social', { email: '' });
      }
      else
      {
        response.render('signup/index',
        {
          oauthMessage: 'We found a user linked to your Twitter account.',
          oauthTwitter: !!request.app.get('twitter-oauth-key'),
          oauthGitHub: !!request.app.get('github-oauth-key'),
          oauthFacebook: !!request.app.get('facebook-oauth-key')
        });
      }
    });
  })(request, response, next);
};

/*******************************************************************************
 * signupGitHub()
 *******************************************************************************
 * Create a new user account via github auth.
 *
 * Inputs:
 *   request:
 *
 *   response:
 *
 *   next:
 */
exports.signupGitHub = function(request, response, next)
{
  request._passport.instance.authenticate('github', function(err, user, info)
  {
    if (!info || !info.profile)
      return response.redirect('/signup/');

    request.app.db.models.User.findOne({ 'github.id': info.profile.id }, function(err, user)
    {
      if (err)
        return next(err);

      if (!user)
      {
        request.session.socialProfile = info.profile;
        response.render('signup/social', { email: info.profile.emails[0].value || '' });
      }
      else
      {
        response.render('signup/index',
        {
          oauthMessage: 'We found a user linked to your GitHub account.',
          oauthTwitter: !!request.app.get('twitter-oauth-key'),
          oauthGitHub: !!request.app.get('github-oauth-key'),
          oauthFacebook: !!request.app.get('facebook-oauth-key')
        });
      }
    });
  })(request, response, next);
};

/*******************************************************************************
 * signupFacebook()
 *******************************************************************************
 * Create a new user account via Facebook auth.
 *
 * Inputs:
 *   request:
 *
 *   response:
 *
 *   next:
 */
exports.signupFacebook = function(request, response, next)
{
  request._passport.instance.authenticate('facebook', { callbackURL: '/signup/facebook/callback/' }, function(err, user, info)
  {
    if (!info || !info.profile)
      return response.redirect('/signup/');

    request.app.db.models.User.findOne({ 'facebook.id': info.profile.id }, function(err, user)
    {
      if (err)
        return next(err);

      if (!user)
      {
        request.session.socialProfile = info.profile;
        response.render('signup/social', { email: info.profile.emails[0].value || '' });
      }
      else
      {
        response.render('signup/index',
        {
          oauthMessage: 'We found a user linked to your Facebook account.',
          oauthTwitter: !!request.app.get('twitter-oauth-key'),
          oauthGitHub: !!request.app.get('github-oauth-key'),
          oauthFacebook: !!request.app.get('facebook-oauth-key')
        });
      }
    });
  })(request, response, next);
};

/*******************************************************************************
 * signupSocial()
 *******************************************************************************
 * Create a new user based on a social login.
 *
 * Inputs:
 *   request:
 *
 *   response:
 */
exports.signupSocial = function(request, response)
{
  var workflow = new request.app.utility.Workflow(request, response);

  workflow.on('validate', function()
  {
    if (!request.body.email)
      workflow.outcome.errfor.email = 'required';
    else if (!/^[a-zA-Z0-9\-\_\.\+]+@[a-zA-Z0-9\-\_\.]+\.[a-zA-Z0-9\-\_]+$/.test(request.body.email))
      workflow.outcome.errfor.email = 'invalid email format';

    //return if we have errors already
    if (workflow.hasErrors())
      return workflow.emit('response');

    workflow.emit('duplicateUsernameCheck');
  });

  // Check for user name already in use.
  workflow.on('duplicateUsernameCheck', function()
  {
    workflow.username = request.session.socialProfile.username;
    if (!/^[a-zA-Z0-9\-\_]+$/.test(workflow.username))
      workflow.username = workflow.username.replace(/[^a-zA-Z0-9\-\_]/g, '');

    request.app.db.models.User.findOne({ username: workflow.username }, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      if (user)
        workflow.username = workflow.username + request.session.socialProfile.id;
      else
        workflow.username = workflow.username;

      workflow.emit('duplicateEmailCheck');
    });
  });

  // Check for email already in use.
  workflow.on('duplicateEmailCheck', function()
  {
    request.app.db.models.User.findOne({ email: request.body.email }, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      if (user)
      {
        workflow.outcome.errfor.email = 'email already registered';
        return workflow.emit('response');
      }

      workflow.emit('createUser');
    });
  });

  // Create the user record.
  workflow.on('createUser', function()
  {
    var fieldsToSet =
    {
      isActive: 'yes',
      username: workflow.username,
      email: request.body.email,
      password: request.app.db.models.User.encryptPassword(request.body.password),
      search: [
        workflow.username,
        request.body.email
      ]
    };

    fieldsToSet[request.session.socialProfile.provider] = request.session.socialProfile._json;

    request.app.db.models.User.create(fieldsToSet, function(err, user)
    {
      if (err)
        return workflow.emit('exception', err);

      workflow.user = user;
      workflow.emit('createAccount');
    });
  });

  // Create an account record linked to the user record.
  workflow.on('createAccount', function()
  {
    var nameParts = request.session.socialProfile.displayName.split(' ');

    var firstName = nameParts[0];
    var lastName = nameParts[1] || '';

    var fieldsToSet =
    {
      'name.first': firstName,
      'name.last': lastName,
      'name.full': request.session.socialProfile.displayName,

      user:
      {
        id: workflow.user._id,
        name: workflow.user.username
      },

      search: [
        firstName,
        lastName
      ]
    };

    request.app.db.models.Account.create(fieldsToSet, function(err, account)
    {
      if (err)
        return workflow.emit('exception', err);

      //update user with account
      workflow.user.roles.account = account._id;
      workflow.user.save(function(err, user)
      {
        if (err)
          return workflow.emit('exception', err);

        workflow.emit('sendWelcomeEmail');
      });
    });
  });

  // Send a welcome email.
  workflow.on('sendWelcomeEmail', function()
  {
    request.app.utility.email(request, response,
    {
      from: request.app.get('email-from-name') +' <'+ request.app.get('email-from-address') +'>',
      to: request.body.email,
      subject: 'Your '+ request.app.get('project-name') +' Account',
      textPath: 'signup/email-text',
      htmlPath: 'signup/email-html',

      locals:
      {
        username: workflow.user.username,
        email: request.body.email,
        loginURL: 'http://'+ request.headers.host +'/login/',
        projectName: request.app.get('project-name')
      },

      success: function(message)
      {
        workflow.emit('logUserIn');
      },

      error: function(err)
      {
        console.log('Error Sending Welcome Email: '+ err);
        workflow.emit('logUserIn');
      }
    });
  });

  // Automatically log the new user in.
  workflow.on('logUserIn', function()
  {
    request.login(workflow.user, function(err)
    {
      if (err)
        return workflow.emit('exception', err);

      delete request.session.socialProfile;
      workflow.outcome.defaultReturnUrl = workflow.user.defaultReturnUrl();
      workflow.emit('response');
    });
  });

  // Kick off the workflow processing.
  workflow.emit('validate');
};
