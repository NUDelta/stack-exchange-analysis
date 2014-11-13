var mongoose = require('mongoose');

var voteSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "postid": {type: Number, index: true},
  "votetypeid": Number,
  "creationdate": Date,
});
voteSchema.set('autoIndex', false);
voteSchema.virtual('xml')
    .get(function() {
      return "Votes.xml";
    });

module.exports = mongoose.model("Vote", voteSchema);