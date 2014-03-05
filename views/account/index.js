var SocialAccountConnector = require('app-server/settings/SocialAccountConnector');

exports.init = function(req, res){
  res.redirect('/account/settings/');
};