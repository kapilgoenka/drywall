//
//  LogoutProcessor.js
//  SportStream Account Server
//
//  Created by Kapil Goenka
//  Copyright 2013 SportStream. All rights reserved.
//
var LogoutProcessor = module.exports;
var RiakDBAccessor = require('lib/app-server/db/RiakDBAccessor');

LogoutProcessor.logout = function(request, response)
{
  var user = request.user;
  user.isLoggedIn = false;

  RiakDBAccessor.update('users', user._id, user, function(error, user)
  {
    if (error)
      return response.send({ success: false });

    response.send({ success: true });
  });
};