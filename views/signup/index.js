var SignupProcessor = require('app-server/signup/SignupProcessor');

/*******************************************************************************
 * init()
 *******************************************************************************
 * Display the signup screen if user is not already logged in.
 *
 * Inputs:
 *   request, response:
 */
exports.init = SignupProcessor.init;

/*******************************************************************************
 * signup()
 *******************************************************************************
 * Create a new user account with username/password.
 *
 * Inputs:
 *   request, response:
 */
exports.signup = SignupProcessor.signupUsernamePassword;

/*******************************************************************************
 * signupSocial()
 *******************************************************************************
 * Process a new user request based on a social login.
 *
 * Inputs:
 *   request, response:
 */
exports.signupSocial = SignupProcessor.processSocialSignupRequest;

/*******************************************************************************
 * signupTwitter()
 *******************************************************************************
 * Create a new user account via Twitter auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.signupTwitter = SignupProcessor.signupTwitter;

/*******************************************************************************
 * signupFacebook()
 *******************************************************************************
 * Create a new user account via Facebook auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.signupFacebook = SignupProcessor.signupFacebook;

/*******************************************************************************
 * signupGitHub()
 *******************************************************************************
 * Create a new user account via github auth.
 *
 * Inputs:
 *   request, response, next:
 */
exports.signupGitHub = SignupProcessor.signupGitHub;
