var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var Underdog = require("./../models/UnderdogModel");
var _ = require("underscore");

Underdog.find({}).populate("parent").sort({"parent.viewcount": -1}).limit(10).exec(function (err, posts) {
  _(posts).each(function (post) {
    console.log(JSON.stringify(post, null, 2));
  });
});