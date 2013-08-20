var sa = require('app-server/admin/SocialAdmin'),
    GoogleAdmin = new sa.SocialAdmin( { socialType: "google" });

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = GoogleAdmin.find.bind(GoogleAdmin);

/*******************************************************************************
 * read
 *******************************************************************************
 * Display a user record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = GoogleAdmin.read.bind(GoogleAdmin);
