//
//  ScriptLoader.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.loadScripts = loadScripts;

function loadScripts(scripts, callback)
{
  var taskRunner = new app.TaskRunner();

  for ( var i = 0, numArgs = arguments.length; i < numArgs; i++ )
  {
    var arg = arguments[i];

    if (_.isArray(arg))
      taskRunner.add(loadScriptsInParallel.bind(null, arg));
    else
      taskRunner.add($.getScript.bind($, arg));
  }

  taskRunner.run(callback);
}

function loadScriptsInParallel(scripts, callback)
{
  var taskRunner = new app.TaskRunner();

  scripts.forEach(function(script)
  {
    taskRunner.add($.getScript.bind($, script));
  } );

  taskRunner.setMaximalConcurrency();
  taskRunner.run(callback);
}
