//
//  config.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var Express = require('express'),
    File = require('fs'),
    Path = require('path'),
    Yaml = require('yaml');


var HOSTNAME = findHostName(),
    APP_NAME = 'app-server',
    CONFIG_FOLDER = Path.normalize(Path.join(__dirname, '..', '..', 'config')),
    CONFIG_FILES = discoverConfigFiles(),
    CONFIG = mergeConfigFiles();

module.exports = CONFIG;


/*
  Configuration files are processed in the following order:
  default.yaml
  (hostname).yaml
  (configuration).yaml
  (hostname)-(configuration).yaml
 */

function existsSync(filePath)
{
  var fn = File.existsSync || Path.existsSync;
  return fn(filePath);
}

function discoverConfigFiles()
{
  if (!existsSync(CONFIG_FOLDER))
  {
    console.log("\n\n" + APP_NAME + ": could not find config folder: " + CONFIG_FOLDER);
    process.exit(1);
  }

  var NODE_ENV = process.env.NODE_ENV || 'development';

  var files = ["default.yaml", NODE_ENV + ".yaml", HOSTNAME + ".yaml", HOSTNAME + "-" + NODE_ENV + ".yaml"];

  var configFiles = [];

  files.forEach(function(file)
  {
    file = Path.join(CONFIG_FOLDER, file.toLowerCase());
    if (!existsSync(file))
      return;
    configFiles.push(file);
  });

  return configFiles;
}



/*
  Merge the values from all the config files that were found.
 */

function mergeConfigFiles()
{
  var config = {};
  CONFIG_FILES.forEach(function(file)
  {
    try
    {
      var text = File.readFileSync(file).toString();
      if (!text)
        return;

      //  Yaml library doesn't like strings that have newlines but don't end in
      //  a newline: https://github.com/visionmedia/js-yaml/issues/issue/13
      text += '\n';
      var yaml = Yaml.eval(text);
      extendObjectWithObject(config, yaml);
    }
    catch (e)
    {
      console.log("\n\n" + APP_NAME + ": could not read config file: " + file);
      console.log(e.message);
      console.log(e.stack);
      process.exit(1);
    }
  });

  config.APP_HOME = Path.normalize(Path.join(__dirname, '..', '..'));
  return config;
}

/*  Discover the hostname. Because node 0.2.x doesn't expose this functionality,
  I'm relying on the HOST or HOSTNAME environment variables. On node 0.3.x,
  this method uses the OS package to discover this information.
 */

function findHostName()
{
  var name;
  try
  {
    var os = require('os');
    name = os.hostname();
  }
  catch (e)
  {
    name = process.env.HOST || process.env.HOSTNAME;
  }

  if (!name)
  {
    console.log("\n\nUnable to determine host name. Set HOST or HOSTNAME environment variables.\n");
    process.exit(1);
  }

  return name.split('.')[0];
}


function extendObjectWithObject(object1, object2)
{
  var toString = Object.prototype.toString;
  var OBJECT_TYPE = toString.call({});

  var o = {};
  var v1, v2;

  for (var p in object2)
  {
    v1 = object1[p];
    v2 = object2[p];

    if (OBJECT_TYPE === toString.call(v1))
    {
      if (OBJECT_TYPE === toString.call(v2))
        extendObjectWithObject(v1, v2);
      else
        v1 = v2;
    }
    else
    {
      v1 = v2;
    }

    object1[p] = v1;
  }

  return object1;
}
