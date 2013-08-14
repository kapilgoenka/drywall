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

  scripts.forEach(function(script)
  {
    taskRunner.add($.getScript.bind($, script));
  } );

  taskRunner.run(callback, 1);
}
