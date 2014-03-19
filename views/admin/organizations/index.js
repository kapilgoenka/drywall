var OrganizationAdmin = require('app-server/admin/OrganizationAdmin');

/*******************************************************************************
 * list
 *******************************************************************************
 * List all organizations
 *
 * Inputs:
 *   request, response, next:
 */
exports.list = OrganizationAdmin.list;

/*******************************************************************************
 * read
 *******************************************************************************
 * Display an organization record
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = OrganizationAdmin.read;
