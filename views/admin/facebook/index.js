var sa = require('app-server/admin/SocialAdmin'),
    FacebookAdmin = new sa.SocialAdmin( { socialType: "facebook" });

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = FacebookAdmin.find.bind(FacebookAdmin);

/*******************************************************************************
 * read
 *******************************************************************************
 * Display a user record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = FacebookAdmin.read.bind(FacebookAdmin);
