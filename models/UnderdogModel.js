var mongoose = require('mongoose');

var underdogSchema = mongoose.Schema({
  "parentQuestionId": Number,
  "answerId": Number,
  "score": Number,
  "ownerUserId": Number,
  "creationDate": Date,
  "parent": {type: mongoose.Schema.ObjectId, ref: 'Post'}
});

module.exports = mongoose.model("Underdog", underdogSchema);