//
//  TaskRunner.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var app = app || {};

app.TaskRunner = TaskRunner;

function TaskRunner()
{
  this.tasks = [];
  this.concurrency = 0;
  this.done = null;
  this.maxConcurrency = 1;
  this.numTasksInProgress = 0;
}

TaskRunner.prototype.add = function(callback)
{
  this.tasks.push(callback);
};

TaskRunner.prototype.setMaxConcurrency = function(maxConcurrency)
{
  this.maxConcurrency = maxConcurrency;
};

TaskRunner.prototype.setMaximalConcurrency = function()
{
  this.setMaxConcurrency(this.numTasks());
};

TaskRunner.prototype.numTasks = function()
{
  return this.tasks.length;
};

TaskRunner.prototype.run = function(done, maxConcurrency)
{
  if (this.numTasks() === 0)
  {
    if (done)
      done();

    return;
  }

  this.done = done || this.done;

  // Override if supplied.
  if (maxConcurrency)
    this.maxConcurrency = maxConcurrency;

  var target = this.tasks.length;
  var that = this;

  var next = function()
  {
    that.numTasksInProgress--;
    that.concurrency--;
    //      (--target === 0 ? that.done() : that.run());
    if (that.tasks.length === 0 && that.numTasksInProgress === 0)
      that.done();
    else
      that.run();
  };

  while (this.concurrency < this.maxConcurrency && this.tasks.length > 0)
  {
    this.concurrency++;
    var callback = this.tasks.shift();
    this.numTasksInProgress++;
    callback(next);
  }
};
