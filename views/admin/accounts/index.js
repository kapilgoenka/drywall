var AccountAdmin = require('lib/app-server/admin/AccountAdmin');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = AccountAdmin.find;

/*******************************************************************************
 * read
 *******************************************************************************
 * Display an account record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = AccountAdmin.read;

/*******************************************************************************
 * create
 *******************************************************************************
 * Create an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.create = AccountAdmin.create;

/*******************************************************************************
 * update
 *******************************************************************************
 * Update an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = AccountAdmin.update;

/*******************************************************************************
 * linkUser
 *******************************************************************************
 * Link a user to an account record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkUser = AccountAdmin.linkUser;

/*******************************************************************************
 * unlinkUser
 *******************************************************************************
 * Unlink a user from an account record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkUser = AccountAdmin.unlinkUser;

/*******************************************************************************
 * deleteAccount
 *******************************************************************************
 * Delete an account.
 *
 * Inputs:
 *   request, response, next:
 */
exports.deleteAccount = AccountAdmin.deleteAccount;
