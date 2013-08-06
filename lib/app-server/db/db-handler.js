//
//  db-handler.js
//  SportStream Account Server
//
//  Created by Satish Bhatti
//  Copyright 2013 SportStream. All rights reserved.
//
var dbh = module.exports;

var mongoose  = require('mongoose'),
    winston = require('winston'),
    log = winston.loggers.get('ss-account-default');

dbh.DbHandler = (function()
{
  /*******************************************************************************
   * DbHandler()
   *******************************************************************************
   * Create a DbHandler instance.
   *
   * Inputs:
   *   dbUri:
   */
  function DbHandler(dbUri)
  {
    this.dbUri = dbUri;
    var dbServers = this.dbUri.split(',');
    log.debug('dbServers = ', dbServers);
    this.dbConnectFunc = (dbServers.length === 1) ? this.connectSingleNode : this.connectReplicaSet;
  }

  /*******************************************************************************
   * connect()
   *******************************************************************************
   * Connect to the database.
   */
  DbHandler.prototype.connect = function(callback)
  {
    this.dbConnectFunc(callback);
  }

  /*******************************************************************************
   * connectReplicaSet()
   *******************************************************************************
   * Connect to the database.
   */
  DbHandler.prototype.connectReplicaSet = function(callback)
  {
    var self = this;
    this.db = mongoose;

    mongoose.connection.on('open', function()
    {
      log.debug("mongodb connection open");
    } );

    log.debug("DbHandler.connectReplicaSet: connecting to ", self.dbUri);

    var connectOptions =
    {
      server:
      {
//        auto_reconnect: true,
        poolSize: 4
      }
    };

    mongoose.connectSet( this.dbUri, 'sportstream', connectOptions, function (error)
    {
      log.debug("DbHandler: connected to ", self.dbUri);
//      var serverConfig = mongoose.connections[0].db.serverConfig;
//      log.debug("DbHandler: serverConfig = ", serverConfig);
      log.debug('mongoose.connections[0].options = ', mongoose.connections[0].options);
      if (error)
        log.error("DbHandler: could not connect to DB: ", error);

      callback && callback(error, self.db);
    });
  };

  DbHandler.prototype.connectSingleNode = function(callback)
  {
    var self = this;
    this.db = mongoose;

    mongoose.connection.on('open', function()
    {
      log.debug("mongodb connection open");
      log.debug("DbHandler: connected to ", self.dbUri);
      callback && callback(null, self.db);
    } );

    log.debug("DbHandler.connectSingleNode: connecting to ", self.dbUri);

    mongoose.connect( this.dbUri );
  };

  return DbHandler;
})();
