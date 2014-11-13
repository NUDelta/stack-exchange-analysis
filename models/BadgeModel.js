var mongoose = require('mongoose');

var badgeSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "userid": {type: Number, index: true},
  "name": String,
  "Date": Date
});
badgeSchema.set('autoIndex', false);
badgeSchema.virtual('xml')
    .get(function() {
      return "Badges.xml";
    });

module.exports = mongoose.model("Badge", badgeSchema);