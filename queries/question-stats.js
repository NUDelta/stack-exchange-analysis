var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var _ = require("underscore");

Post.count({
}, function (err, c) {
  console.log("Number of questions and answers: ", c);
});

Post.count({
  posttypeid: 1
}, function (err, c) {
  console.log("Number of questions: ", c);
});

Post.count({
  posttypeid: 2
}, function (err, c) {
  console.log("Number of answers: ", c);
});

Post.count({
  posttypeid: 1,
  acceptedanswerid: null
}, function (err, c) {
  console.log("Number of questions without accepted answer: ", c);
});

Post.count({
  posttypeid: 1,
  acceptedanswerid: {$gt: 0}
}, function (err, c) {
  console.log("Number of questions with accepted answer: ", c);
});

Post.count({
  posttypeid: 1,
  answercount: {$gt: 0}
}, function (err, c) {
  console.log("Number of questions with at least one answer:", c);
});

Post.count({
  posttypeid: 1,
  answercount: {$lt: 1}
}, function (err, c) {
  console.log("Number of questions without any answers:", c);
});