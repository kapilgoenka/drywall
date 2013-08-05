var AdministratorAdmin = require('lib/app-server/admin/AdministratorAdmin');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find an admin.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = AdministratorAdmin.find;

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = AdministratorAdmin.read;

/*******************************************************************************
 * create
 *******************************************************************************
 * Create an admin.
 *
 * Inputs:
 *   request, response, next:
 */
exports.create = AdministratorAdmin.create;

/*******************************************************************************
 * update
 *******************************************************************************
 * Update an admin.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = AdministratorAdmin.update;

/*******************************************************************************
 * groups
 *******************************************************************************
 * Update admin group membership.
 *
 * Inputs:
 *   request, response, next:
 */
exports.groups = AdministratorAdmin.groups;

/*******************************************************************************
 * updatePermissions
 *******************************************************************************
 * Update permissions for an admin.
 *
 * Inputs:
 *   request, response, next:
 */
exports.permissions = AdministratorAdmin.updatePermissions;

/*******************************************************************************
 * linkUser
 *******************************************************************************
 * Link a user to an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.linkUser = AdministratorAdmin.linkUser;

/*******************************************************************************
 * unlinkUser
 *******************************************************************************
 * Unlink a user from an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.unlinkUser = AdministratorAdmin.unlinkUser;

/*******************************************************************************
 * deleteAdmin
 *******************************************************************************
 * Delete an admin record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.deleteAdmin = AdministratorAdmin.deleteAdmin;
