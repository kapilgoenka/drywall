var ForgotLoginProcessor = require('app-server/login/ForgotLoginProcessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the forgot login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response
 */
exports.init = ForgotLoginProcessor.init;

/*******************************************************************************
 * send
 *******************************************************************************
 * Send a reset password email to a user.
 *
 * Inputs:
 *   request, response
 */
exports.send = ForgotLoginProcessor.send;
