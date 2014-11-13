var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "posttypeid": {type: Number, index: true},
  "parentid": {type: Number, index: true},
  "acceptedanswerid": Number,
  "accepted": {type: Boolean, default: false},
  "score": Number,
  "viewcount": Number,
  "owneruserid": Number,
  "ownerdisplayname": String,
  "commentcount": Number,
  "answercount": Number,
  "favoritecount": Number,
  "lasteditoruserid": Number,
  "lasteditordisplayname": String,
  "creationdate": Date,
  "lasteditdate": Date,
  "lastactivitydate": Date,
  "communityowneddate": Date,
  "tags": String
});
//postSchema.set('autoIndex', false);
postSchema.virtual('xml')
    .get(function () {
      return "Posts.xml";
    });

module.exports = mongoose.model("Post", postSchema);