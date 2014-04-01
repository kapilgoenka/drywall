var LoginProcessor = require('app-server/login/LoginProcessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the login screen if user is not already logged in.
 *
 * Inputs:
 *   request, response:
 */
exports.init = LoginProcessor.init;

/*******************************************************************************
 * loginUsernamePassword
 *******************************************************************************
 * Login using username and password.
 *
 * Inputs:
 *   request, response
 */
exports.login = LoginProcessor.loginUsernamePassword;

/*******************************************************************************
 * isLoggedIn
 *******************************************************************************
 *
 * Inputs:
 *   request, response
 */
exports.isLoggedIn = LoginProcessor.isLoggedIn;

/*******************************************************************************
 * loginTwitter
 *******************************************************************************
 * Login using Twitter auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.loginTwitter = LoginProcessor.loginTwitter;

/*******************************************************************************
 * loginFacebook
 *******************************************************************************
 * Login using Facebook auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.loginFacebook = LoginProcessor.loginFacebook;

/*******************************************************************************
 * loginGoogle
 *******************************************************************************
 * Login using Google auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.loginGoogle = LoginProcessor.loginGoogle;

/*******************************************************************************
 * loginGitHub
 *******************************************************************************
 * Login using Github auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.loginGitHub = LoginProcessor.loginGitHub;

exports.loginSingly = LoginProcessor.loginSingly;
