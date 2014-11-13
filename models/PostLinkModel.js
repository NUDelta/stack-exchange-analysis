var mongoose = require('mongoose');

var postLinkSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "postid": {type: Number, index: true},
  "relatedpostid": {type: Number, index: true},
  "linktypeid": Number,
  "creationdate": Date
});
postLinkSchema.set('autoIndex', false);
postLinkSchema.virtual('xml')
    .get(function() {
      return "PostLinks.xml";
    });

module.exports = mongoose.model("PostLink", postLinkSchema);