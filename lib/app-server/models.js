exports = module.exports = function(app, mongoose) {

  //user system
  require('app-server/schema/User')(app, mongoose);
  require('app-server/schema/Admin')(app, mongoose);
  require('app-server/schema/AdminGroup')(app, mongoose);
  require('app-server/schema/Account')(app, mongoose);
}
