exports = module.exports = function(app, mongoose)
{
  var pagedFind = require('app-server/db/schema/plugins/pagedFind');

  var adminGroupSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, default: '' },
    permissions: [{ name: String, permit: Boolean }]
  });

  adminGroupSchema.plugin(pagedFind);
  adminGroupSchema.index({ name: 1 }, { unique: true });
//  adminGroupSchema.set('autoIndex', (app.get('env') == 'development'));

  app.db.model('AdminGroup', adminGroupSchema, 'adminGroups');
}
