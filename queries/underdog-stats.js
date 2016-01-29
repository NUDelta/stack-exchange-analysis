var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var Underdog = require("./../models/UnderdogModel");
var _ = require("underscore");

Post.count({
  posttypeid: 1,
  acceptedanswerid: {$gt: 0}
}, function (err, postCount) {
  console.log("Total number of questions with accepted answers:", postCount);

  Underdog.count({}, function (err, uCount) {
    console.log("Number of underdogs: " + uCount);
    console.log("Percentage of underdogs in answered questions: " + (uCount / postCount) * 100 + "%");
  });
});

Post.count({
  posttypeid: 1,
  acceptedanswerid: {$gt: 0},
  viewcount: {$gt: 1000}
}, function (err, postCount) {
  console.log("Total number of questions with accepted answers view over 1000 times:", postCount);

  var stream = Underdog.find({}).populate("parent").stream();

  var rowCount = 0;
  stream.on('data', function (post) {
    if (post.parent.viewcount > 999) {
      rowCount++;
    }
  });
  stream.on('end', function (post) {
    console.log("Number of underdogs viewed over 1000 times: ", rowCount)
  });
});
