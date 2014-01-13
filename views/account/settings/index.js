var SocialAccountConnector = require('app-server/settings/SocialAccountConnector'),
    UserUpdater = require('app-server/settings/UserUpdater');

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
 * connectGoogle
 *******************************************************************************
 * Connect a Google account to an existing user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.connectGoogle = SocialAccountConnector.connectGoogle;

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
 * disconnectGoogle
 *******************************************************************************
 * Disconnect a Google account from a user account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.disconnectGoogle = SocialAccountConnector.disconnectGoogle;

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
exports.update = UserUpdater.updateContactInfo;

/*******************************************************************************
 * updateIdentity
 *******************************************************************************
 * Update Identity Info for an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.identity = UserUpdater.updateIdentity;

/*******************************************************************************
 * updatePassword
 *******************************************************************************
 * Update password for an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.password = UserUpdater.updatePassword;
