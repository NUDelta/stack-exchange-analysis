var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  "id": {type: Number, index: true},
  "reputation": Number,
  "creationdate": Date,
  "displayname": String,
  "LastAccessDate": Date,
  "upvotes": Number,
  "downvotes": Number,
  "accountid": Number,
  "age": Number
});
userSchema.set('autoIndex', false);
userSchema.virtual('xml')
    .get(function() {
      return "Users.xml";
    });

module.exports = mongoose.model("User", userSchema);