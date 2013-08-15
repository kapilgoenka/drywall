//
//  ScriptLoader.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.loadScripts = loadScriptsInSeries;

/*******************************************************************************
 * loadScriptsInSeries()
 *******************************************************************************
 * Dynamically load a set of JS files.
 *
 * Inputs:
 *   scripts[], callback
 */
function loadScriptsInSeries(scripts, callback)
{
  var taskRunner = new app.TaskRunner();

  scripts.forEach(function(script)
  {
    taskRunner.add(loadScriptTask.bind(null, script));
  } );

  taskRunner.run(callback);
}

/*******************************************************************************
 * loadScripts()
 *******************************************************************************
 * Dynamically load a set of JS files.
 *
 * Inputs:
 *   scripts, callback
 */
function loadScripts()
{
  var taskRunner = new app.TaskRunner();
  var i = 0;

  for ( var numArgs = arguments.length - 1; i < numArgs; i++ )
  {
    var arg = arguments[i];

    if (_.isArray(arg))
      taskRunner.add(loadScriptsInParallelTask.bind(null, arg));
    else
      taskRunner.add(loadScriptTask.bind(null, arg));
  }

  var callback = arguments[i];
  taskRunner.run(callback);
}

/*******************************************************************************
 * loadScriptsInParallelTask()
 *******************************************************************************
 * TaskRunner task for dynamically loading a set of JS files in parallel.
 *
 * Inputs:
 *   scripts, next
 */
function loadScriptsInParallelTask(scripts, next)
{
  var taskRunner = new app.TaskRunner();

  scripts.forEach(function(script)
  {
    taskRunner.add(loadScriptTask.bind(null, script));
  } );

  taskRunner.setMaximalConcurrency();
  taskRunner.run(next);
}

/*******************************************************************************
 * loadScriptTask()
 *******************************************************************************
 * TaskRunner task for dynamically loading a JS file.
 *
 * Inputs:
 *   script, next
 */
function loadScriptTask(script, next)
{
  $.getScript(script, function()
  {
    next();
  } );
}
