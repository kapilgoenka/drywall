var EventAdmin = require('app-server/admin/EventAdmin');

/*******************************************************************************
 * list
 *******************************************************************************
 * List all events
 *
 * Inputs:
 *   request, response, next:
 */
exports.list = EventAdmin.list;

/*******************************************************************************
 * read
 *******************************************************************************
 * Display an events record
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = EventAdmin.read;
