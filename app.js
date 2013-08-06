//dependencies
var Config = require('app-server/config'),
    log = require('app-server/log-controller').LogController.initLoggers(Config.logLevel),
    express = require('express'),
    mongoStore = require('connect-mongo')(express),
    http = require('http'),
    path = require('path'),
    redis = require("redis"),
    RedisStore = require("connect-redis")(express),
    passport = require('passport'),
    mongoose = require('mongoose'),
    dba = require('app-server/db-accessors'),
    cors = require('app-server/cors');

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
/*
  setTimeout(function() {
    process.exit(1);
  },100);
*/
});

var App = module.exports;
var app = express();
App.app = app;

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

  //utilities
  require('app-server/utilities')(app);

  log.info("app.get('env') = " + app.get('env'));

  dba.getDBAccessors().init(Config.mongoDBConnectURL, function(error, db)
  {
    app.db = db;

    // Config data models.
    require('app-server/models')(app, db);

    // Listen up
    http.createServer(app).listen(Config.port, function()
    {
      log.info('listening on port ' + Config.port);
    } );
  } );
}

initialize();

/*
//mongo uri
app.set('mongodb-uri', process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/drywall');

//setup mongoose
app.db = mongoose.createConnection(app.get('mongodb-uri'));
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  console.log('mongoose open for business');
});
*/

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
  app.set('project-name', 'SportStream Webapp');
  app.set('company-name', 'SportStream');
  app.set('admin-email', 'extropy@gmail.com');
  app.set('crypto-key', 'k3yb0ardc4t');

  //email (smtp) settings
  app.set('email-from-name', app.get('project-name')+ ' Website');
  app.set('email-from-address', 'extropy@gmail.com');
  app.set('email-credentials', {
    user: 'extropy@gmail.com',
    password: 'SangYuan1977!',
    host: 'smtp.gmail.com',
    ssl: true
  });

  // Twitter settings
  app.set('twitter-oauth-key', Config.twitterAuth.consumerKey);
  app.set('twitter-oauth-secret', Config.twitterAuth.consumerSecret);

  // Github settings
  app.set('github-oauth-key', '');
  app.set('github-oauth-secret', '');

  // Facebook settings
  app.set('facebook-oauth-key', Config.facebookAuth.consumerKey);
  app.set('facebook-oauth-secret', Config.facebookAuth.consumerSecret);

  // Singly settings
  app.set('singly-app-id', '401fcb43bfc43038e4c6bc381c4e1530');
  app.set('singly-app-secret', '0c4ebeadda03d6b2ee0e5a4fee6b1b5b');
  app.set('singly-callback-url', 'http://localhost:' + app.get('port') + '/auth/singly/callback');

  // Middleware
  app.use(express.favicon(__dirname + '/public/favicon.ico'));

  app.use(express.logger('dev'));

  app.use(express.logger({
    format: ':date :response-time :method :url (:status)'
  }));

  app.use(express.errorHandler({
    dumpExceptions: true
  }));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  var foo =
  {
    "_id": "XY70N7IzqzSQhtukiqNzjfJG",
    "session": "{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"passport\":{\"user\":\"51af74beae2f9af312000005\"}}"
  };

  var session =
  {
    cookie:
    {
      originalMaxAge: null,
      expires: null,
      httpOnly: true,
      path: "/"
    },

    passport:
    {
      user: "51af74beae2f9af312000005"
    }
  }

// Setup session store.
  app.use(express.cookieParser());
/*
  app.use(express.session({
    secret: "Sup3rS3cr3tK3y",
    store: new mongoStore({ url: app.get('mongodb-uri') }),
    expires: new Date(Date.now() + (30 * 86400 * 1000))
  }));
*/
  app.use(express.session({
    secret: "Sup3rS3cr3tK3y",
    store: new RedisStore({ client: redisClient/*, ttl: 60*/ }),
//    store: new mongoStore({ url: app.get('mongodb-uri') }),
///*
    cookie:
    {
      maxAge: 30 * 60 * 1000//30 * 60 * 1000
//      expires: new Date(Date.now() + (30 * 86400 * 1000))
    }
//*/
  }));
/*
  app.use(express.session({
    secret: 'Sup3rS3cr3tK3y',
    store: new mongoStore({ url: app.get('mongodb-uri') })
  }));
*/
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);

  //error handler
  app.use(require('views/http/index').http500);

  //locals
  app.locals.projectName = app.get('project-name');
  app.locals.copyrightYear = new Date().getFullYear();
  app.locals.copyrightName = app.get('company-name');
}
