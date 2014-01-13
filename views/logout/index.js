exports.init = function(req, res){
  req.logout();

  if (req.isAjaxRequest)
    res.send(200);
  else
    res.redirect('/');
};
