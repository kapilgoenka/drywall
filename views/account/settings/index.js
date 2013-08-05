var SocialAccountConnector = require('lib/app-server/SocialAccountConnector'),
    AccountUpdater = require('lib/app-server/AccountUpdater');

/*******************************************************************************
 * init
 *******************************************************************************
 * Render the current settings.
 *
 * Inputs:
 *   request, response, next:
 */
exports.init = SocialAccountConnector.displaySettings;

/*******************************************************************************
 * connectTwitter
 *******************************************************************************
 * Connect a Twitter account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.connectTwitter = SocialAccountConnector.connectTwitter;

/*******************************************************************************
 * connectFacebook
 *******************************************************************************
 * Connect a Facebook account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.connectFacebook = SocialAccountConnector.connectFacebook;

/*******************************************************************************
 * connectGitHub
 *******************************************************************************
 * Connect a Github account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.connectGitHub = SocialAccountConnector.connectGitHub;

/*******************************************************************************
 * disconnectTwitter
 *******************************************************************************
 * Disconnect a Twitter account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.disconnectTwitter = SocialAccountConnector.disconnectTwitter;

/*******************************************************************************
 * disconnectFacebook
 *******************************************************************************
 * Disconnect a Facebook account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.disconnectFacebook = SocialAccountConnector.disconnectFacebook;

/*******************************************************************************
 * disconnectGitHub
 *******************************************************************************
 * Disconnect a Github account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.disconnectGitHub = SocialAccountConnector.disconnectGitHub;

/*******************************************************************************
 * updateContactInfo
 *******************************************************************************
 * Update Contact Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = AccountUpdater.updateContactInfo;

/*******************************************************************************
 * updateIdentity
 *******************************************************************************
 * Update Identity Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.identity = AccountUpdater.updateIdentity;

/*******************************************************************************
 * updatePassword
 *******************************************************************************
 * Update password for an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.password = AccountUpdater.updatePassword;
