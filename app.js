//dependencies
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    http = require('http'),
    path = require('path'),
    redis = require("redis"),
    RedisStore = require("connect-redis")(express),
    passport = require('passport'),
    mongoose = require('mongoose');

//create express app
var app = express();

//mongo uri
app.set('mongodb-uri', process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/drywall');

//setup mongoose
app.db = mongoose.createConnection(app.get('mongodb-uri'));
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  console.log('mongoose open for business');
});

//config data models
require('./models')(app, mongoose);

var redisClient = redis.createClient();//Config.redis.port, Config.redis.host);

//config all
app.configure(function(){
  //settings
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

  //twitter settings
  app.set('twitter-oauth-key', 'uHL6SowhaQh6WrOVSbhtVA');
  app.set('twitter-oauth-secret', 'LsTKjFPCSEQKGQVmdTPnU1gIGGkEA4PfMMzuGqi4');

  //github settings
  app.set('github-oauth-key', '');
  app.set('github-oauth-secret', '');

  //facebook settings
  app.set('facebook-oauth-key', '163806877127308');//'247109212019120');
  app.set('facebook-oauth-secret', 'f8238d22de9e81e5c71bd410006d313d');// '6ef812a00c5a4f4d0ed0ec48cee2aa6e');

  //Singly settings
  app.set('singly-app-id', '401fcb43bfc43038e4c6bc381c4e1530');
  app.set('singly-app-secret', '0c4ebeadda03d6b2ee0e5a4fee6b1b5b');
  app.set('singly-callback-url', 'http://localhost:' + app.get('port') + '/auth/singly/callback');

  //middleware
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
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
  app.use(require('./views/http/index').http500);

  //locals
  app.locals.projectName = app.get('project-name');
  app.locals.copyrightYear = new Date().getFullYear();
  app.locals.copyrightName = app.get('company-name');
});

//config dev
app.configure('development', function(){
  app.use(express.errorHandler());
});

//config passport
require('./passport')(app, passport);

//route requests
require('./routes')(app, passport);

//utilities
require('./utilities')(app);

//listen up
http.createServer(app).listen(app.get('port'), function(){
  console.log('express server listening on port ' + app.get('port'));
});
