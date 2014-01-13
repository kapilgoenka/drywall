//dependencies
var Config = require('app-server/config'),
    log = require('app-server/log-controller').LogController.initLoggers(Config.logLevel),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    redis = require("redis"),
    RedisStore = require("connect-redis")(express),
    passport = require('passport'),
    crypto = require('crypto'),
    dba = require('app-server/db-accessors'),
    cors = require('app-server/cors'),
    RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

//  When there's no NODE_ENV environment variable, default to development
if (!process.env.NODE_ENV)
  process.env.NODE_ENV = 'development';

// Select custom port via command line
var argv = require('optimist').argv;
if ( argv.port )
{
  Config.port = argv.port;
  log.debug("Using commandline port override: port = " + Config.port);
}

process.on('uncaughtException', function(err)
{
  var skip = ['message', 'stack', 'name', 'type', 'arguments'];
  var text = "Uncaught exception";
  if (err.stack)
    text += "\n" + err.stack;

  for (var p in err)
  {
    if (-1 !== skip.indexOf(p))
      continue;
    text += "\n  " + p + ": " + JSON.stringify(err[p]);
  }
  text += "\n";

  log.error(text);
  log.error('Killing process with pid =' + process.pid + ' due to uncaught exception');
});

var App = module.exports;
var app = express();
App.app = app;
app.db = RiakDBAccessor;

require('app-server/MigrateScript').initMigrate(function(error, response)
{
  console.log(error);
  console.log(response);
});

app.encryptPassword = function(password)
{
  return crypto.createHmac('sha512', app.get('crypto-key')).update(password).digest('hex');
};

app.canPlayRoleOf = function(user, role)
{
  return !!user.accounts[role];
};

app.defaultReturnUrl = function(user)
{
  var returnUrl = '/';

  // if (this.canPlayRoleOf(user, 'media_curation'))
  //   returnUrl = '/account/';

  if (this.canPlayRoleOf(user, 'admin'))
    returnUrl = '/admin/';

  return returnUrl;
};

function initialize()
{
  // Configure all.
  app.configure(configureApp);

  // Config dev
  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  //config passport
  require('app-server/passport')(app, passport);

  //route requests
  require('app-server/routes')(app, passport);

  log.info("app.get('env') = " + app.get('env'));

  // Listen up
  http.createServer(app).listen(Config.port, function()
  {
    log.info('listening on port ' + Config.port);

    // require('lib/app-server/db/RiakDBAccessor').findOne('users', { username: 'root' }, function(error, user)
    // {
    //   if (error || !user)
    //   {
    //     require('lib/app-server/db/RiakDBAccessor').insertRootUser(function(error, user)
    //     {
    //       require('lib/app-server/db/RiakDBAccessor').insertRootAdmin(user, function(error, admin)
    //       {
    //         require('lib/app-server/db/RiakDBAccessor').insertRootGroup(function(error, group)
    //         {
    //           console.log('done');
    //         });
    //       });
    //     });
    //   }
    // });
  } );
}

initialize();

function configureApp()
{
  var redisClient = redis.createClient(Config.redis.port, Config.redis.host);

  // Cross Domain (CORS)
  app.use(cors);

  // Settings
  app.disable('x-powered-by');
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('strict routing', true);
  app.set('project-name', 'SportStream Account System');
  app.set('company-name', 'SportStream');
  app.set('admin-email', 'xxx@gmail.com');
  app.set('crypto-key', 'k3yb0ardc4t');
  app.set('JWT_TOKEN_SECRET', 'Sup3rS3cr3tK3y_for_token_auth');

  app.set('APP_WHITELIST', [
    'keyword_insights',
    'media_curation',
    'admin_portal'
  ]);

  app.set('APP_BUCKETS', {
    keyword_insights: 'keyword_insights_accounts',
    media_curation: 'media_curation_accounts',
    admin_portal: 'admin_portal_accounts'
  });

  //email (smtp) settings
  app.set('email-from-name', app.get('project-name')+ ' Website');
  app.set('email-from-address', 'xxx@gmail.com');
  app.set('email-credentials', {
    user: 'xxx@gmail.com',
    password: '',
    host: 'smtp.gmail.com',
    ssl: true
  });

  // Facebook settings
  app.set('facebook-oauth-key', Config.facebookAuth.consumerKey);
  app.set('facebook-oauth-secret', Config.facebookAuth.consumerSecret);

  // Twitter settings
  app.set('twitter-oauth-key', Config.twitterAuth.consumerKey);
  app.set('twitter-oauth-secret', Config.twitterAuth.consumerSecret);

  // Google settings
  app.set('google-oauth-key', "AIzaSyDM1ztmVgewZk9x3W8bWPDtGTZYd0N2fDw");
  app.set('google-client-id', "143492133138.apps.googleusercontent.com");
  app.set('google-client-secret', "57y6IVjMtvFf_N3fNvglEM8O");

  // Github settings
  app.set('github-oauth-key', '');
  app.set('github-oauth-secret', '');

  // Singly settings
  app.set('singly-app-id', '401fcb43bfc43038e4c6bc381c4e1530');
  app.set('singly-app-secret', '0c4ebeadda03d6b2ee0e5a4fee6b1b5b');
  app.set('singly-callback-url', 'http://localhost:' + app.get('port') + '/auth/singly/callback');

  // Middleware
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function(req, res, next)
  {
    if (req.method === 'OPTIONS')
      res.send(200);
    else
      next();
  });

  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(function(req, res, next)
  {
    req.isAjaxRequest = (req.headers['x-requested-with'] === 'XMLHttpRequest');
    next();
  });

  // Setup session store
  app.use(express.cookieParser());

  app.use(express.session(
  {
    secret: "Sup3rS3cr3tK3y",
    store: new RedisStore({ client: redisClient/*, ttl: 60*/ }),
    cookie:
    {
      maxAge: 30 * 60 * 1000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  //error handler
  app.use(require('views/http/index').http500);

  //locals
  app.locals.projectName = app.get('project-name');
  app.locals.copyrightYear = new Date().getFullYear();
  app.locals.copyrightName = app.get('company-name');
  app.locals.cacheBreaker = 'br34k-01';
}
