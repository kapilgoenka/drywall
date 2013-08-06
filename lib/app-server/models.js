exports = module.exports = function(app, mongoose)
{
  //user system
  require('app-server/db/schema/User')(app, mongoose);
  require('app-server/db/schema/Admin')(app, mongoose);
  require('app-server/db/schema/AdminGroup')(app, mongoose);
  require('app-server/db/schema/Account')(app, mongoose);
};