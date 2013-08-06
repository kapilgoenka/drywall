//
//  SSUtil.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var Config = require('app-server/config'),
    util = require('util'),
    _ = require('underscore');

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
}
