var ResetLoginProcessor = require('app-server/login/ResetLoginProcessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the reset login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response
 */
exports.init = ResetLoginProcessor.init;

/*******************************************************************************
 * set
 *******************************************************************************
 * Set a new password for a user.
 *
 * Inputs:
 *   request, response
 */
exports.set = ResetLoginProcessor.set;
