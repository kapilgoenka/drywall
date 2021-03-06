var sa = require('app-server/admin/SocialAdmin'),
    TwitterAdmin = new sa.SocialAdmin( { socialType: "twitter" });

/*******************************************************************************
 * find
 *******************************************************************************
 * Find a user.
 *
 * Inputs:
 *   request, response, next:
 */
exports.find = TwitterAdmin.find.bind(TwitterAdmin);

/*******************************************************************************
 * read
 *******************************************************************************
 * Display a user record.
 *
 * Inputs:
 *   request, response, next:
 */
exports.read = TwitterAdmin.read.bind(TwitterAdmin);
