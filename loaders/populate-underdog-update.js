var _ = require("underscore");
var plotly = require('plotly')('y3sh', 'w9w6r6shwo');
var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var Underdog = require("./../models/UnderdogModel");

var maxViews = 2000000;
var viewCountRange = maxViews / 500;
var countMap = {};
var startTime = new Date().getTime();
var stream = Underdog.find({}).stream();

var rowCount = 0;
stream.on('data', function (post) {
  var that = this;
  this.pause();
  Post.findOne({
    id: post.parentQuestionId
  }).exec(function (e, parentPost) {
    post.parent = parentPost;
    post.save();

    rowCount++;
    that.resume()
  });
});
stream.on('end', function (post) {
  var endTime = new Date().getTime();
  console.log(rowCount + "All done! | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")

  Underdog.find({}).limit(10).populate('parent').exec(function (a, b) {
    _.each(b, function (p) {
      console.log(JSON.stringify(p, null, 2))
    });
  });
});
