var TwitterAdmin = require('app-server/admin/TwitterAdmin');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = TwitterAdmin.find;

/*******************************************************************************
 * read
 *******************************************************************************
 * Display a user record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = TwitterAdmin.read;
