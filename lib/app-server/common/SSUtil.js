//
//  SSUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var Config = require('app-server/config'),
    util = require('util'),
    _ = require('underscore'),
    EmailSender = require('app-server/common/EmailSender'),
    log = require('app-server/log-controller').logger;

var ssutil = module.exports;

ssutil.randomIntInRange = function(from, to)
{
  return Math.floor(Math.random() * (to - from + 1) + from);
};

ssutil.randomInt = function(num)
{
  return this.randomIntInRange(0, num - 1);
};

ssutil.inspect = function(object, depth)
{
  depth = depth || 2;
  if (_.isObject(object))
    return util.inspect(object, false, depth, false);

  return object;
};

ssutil.arrayAsMap = function(array, map)
{
  map = map || {};

  if (!array || array.length === 0)
    return map;

  array.forEach( function(value)
  {
    map[value] = true;
  } );

  return map;
};

ssutil.slugify = function(text)
{
  return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

ssutil.sendEmailReport = function(request, response, emailContent, callback)
{
  emailContent = emailContent || {};
  emailContent.requestBody = request.body;
  emailContent.requestUser = request.user;
  emailContent.requestURL = request.url;
  emailContent.requestMethod = request.method;

  EmailSender.email(request, response,
  {
    from: require('app').app.get('email-from-address'),
    to: require('app').app.get('email-dev-support-address'),
    subject: 'Account System Error Report',
    text: JSON.stringify(emailContent, null, 4),

    success: function(message)
    {
      if (callback)
        callback();
    },

    error: function(error)
    {
      log.error('Error Sending Welcome Email: '+ error);

      if (callback)
        callback();
    }
  });
};
