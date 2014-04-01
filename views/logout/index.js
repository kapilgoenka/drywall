var LogoutProcessor = require('app-server/logout/LogoutProcessor');

exports.init = function(req, res)
{
  if (req.xhr)
    LogoutProcessor.logout(req, res);
  else
  {
    req.logout();
    res.redirect('/');
  }
};
