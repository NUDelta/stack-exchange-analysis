var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "tagname": String,
  "count": Number,
  "excerptpostid": Number,
  "wikipostid": Number
});
tagSchema.set('autoIndex', false);
tagSchema.virtual('xml')
    .get(function() {
      return "Tags.xml";
    });

module.exports = mongoose.model("Tag", tagSchema);