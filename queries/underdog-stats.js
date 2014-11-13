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
  posttypeid: 1
}, function (err, postCount) {
  Underdog.count({}, function (err, uCount) {
    console.log("Percentage of underdogs in all questions: " + (uCount / postCount) * 100 + "%");
  });
});

Underdog.find({}).limit(10).exec(function (err, posts) {
  _(posts).each(function (post) {
    console.log(JSON.stringify(post, null, 2));
  });
});