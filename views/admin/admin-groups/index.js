var GroupAdmin = require('app-server/admin/GroupAdmin');

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a group.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = GroupAdmin.find;

/*******************************************************************************
 * read
 *******************************************************************************
 * Fetch a group record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = GroupAdmin.read;

/*******************************************************************************
 * create
 *******************************************************************************
 * Create a group.
 *
 * Inputs:
 *   request, response, next:
 */
exports.create = GroupAdmin.create;

/*******************************************************************************
 * update
 *******************************************************************************
 * Update a group.
 *
 * Inputs:
 *   request, response, next:
 */
exports.update = GroupAdmin.update;

/*******************************************************************************
 * updatePermissions
 *******************************************************************************
 * Update permissions for a group.
 *
 * Inputs:
 *   request, response, next:
 */
exports.permissions = GroupAdmin.updatePermissions;

/*******************************************************************************
 * deleteGroup
 *******************************************************************************
 * Delete a group.
 *
 * Inputs:
 *   request, response, next:
 */
exports.deleteGroup = GroupAdmin.deleteGroup;
