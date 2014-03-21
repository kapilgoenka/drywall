exports.init = function(req, res){
  req.logout();

  if (req.xhr)
    res.send(200);
  else
    res.redirect('/');
};
