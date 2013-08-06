exports = module.exports = function(app)
{
  //create utility object in app
  app.utility = {};

  //setup utilities
  app.utility.email = require('app-server/utilities/email');
  app.utility.slugify = require('app-server/utilities/slugify');
  app.utility.Workflow = require('app-server/utilities/Workflow').Workflow;
};