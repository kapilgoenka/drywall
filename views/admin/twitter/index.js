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

/*******************************************************************************
 * create
 *******************************************************************************
 * Create a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.create = TwitterAdmin.create;

/*******************************************************************************
 * update
 *******************************************************************************
 * Update a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = TwitterAdmin.update;

/*******************************************************************************
 * password
 *******************************************************************************
 * Update a user password.
 *
 * Inputs:
 *   request, response, next:
 */
exports.password = TwitterAdmin.updatePassword;

/*******************************************************************************
 * linkAdmin
 *******************************************************************************
 * Link an admin to a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkAdmin = TwitterAdmin.linkAdmin;

/*******************************************************************************
 * unlinkAdmin
 *******************************************************************************
 * Unlink an admin from a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkAdmin = TwitterAdmin.unlinkAdmin;

/*******************************************************************************
 * linkAccount
 *******************************************************************************
 * Link an account to a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkAccount = TwitterAdmin.linkAccount;

/*******************************************************************************
 * unlinkAccount
 *******************************************************************************
 * Unlink an account from a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkAccount = TwitterAdmin.unlinkAccount;

/*******************************************************************************
 * deleteUser
 *******************************************************************************
 * Delete a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.deleteUser = TwitterAdmin.deleteUser;
