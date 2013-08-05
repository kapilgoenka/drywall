var UserAdmin = require('lib/app-server/admin/UserAdmin');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = UserAdmin.find;

/*******************************************************************************
 * read
 *******************************************************************************
 * Display a user record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = UserAdmin.read;

/*******************************************************************************
 * create
 *******************************************************************************
 * Create a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.create = UserAdmin.create;

/*******************************************************************************
 * update
 *******************************************************************************
 * Update a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = UserAdmin.update;

/*******************************************************************************
 * password
 *******************************************************************************
 * Update a user password.
 *
 * Inputs:
 *   request, response, next:
 */
exports.password = UserAdmin.updatePassword;

/*******************************************************************************
 * linkAdmin
 *******************************************************************************
 * Link an admin to a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkAdmin = UserAdmin.linkAdmin;

/*******************************************************************************
 * unlinkAdmin
 *******************************************************************************
 * Unlink an admin from a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkAdmin = UserAdmin.unlinkAdmin;

/*******************************************************************************
 * linkAccount
 *******************************************************************************
 * Link an account to a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkAccount = UserAdmin.linkAccount;

/*******************************************************************************
 * unlinkAccount
 *******************************************************************************
 * Unlink an account from a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkAccount = UserAdmin.unlinkAccount;

/*******************************************************************************
 * deleteUser
 *******************************************************************************
 * Delete a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.deleteUser = UserAdmin.deleteUser;
