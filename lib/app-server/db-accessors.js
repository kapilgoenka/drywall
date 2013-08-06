//
//  db-accessors.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var dba = module.exports;

var Dbh = require('app-server/db/db-handler');

dba.getDBAccessors = function()
{
  if (!dba.dbAccessors)
    dba.dbAccessors = new dba.DBAccessors();

  return dba.dbAccessors;
};

dba.DBAccessors = (function()
{
  /*******************************************************************************
   * DBAccessors()
   *******************************************************************************
   * Create a new instance of DBAccessors.
   */
  function DBAccessors()
  {
  }

  /*******************************************************************************
   * init()
   *******************************************************************************
   * Return a connection to the DB.
   */
  DBAccessors.prototype.init = function(dbUri, callback)
  {
    var dbh = new Dbh.DbHandler(dbUri);
    dbh.connect(callback);
  }

  return DBAccessors;
})();
