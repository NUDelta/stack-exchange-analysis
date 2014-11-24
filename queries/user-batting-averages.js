var db = require("./../connect").db();
var User = require('./../models/UserModel');
var Post = require('./../models/PostModel');
var Vote = require('./../models/VoteModel');
var _ = require('underscore');

User.collection.ensureIndex({reputation: 1}, function () {
  User.count({}, function (err, uCount) {
    calcStats(uCount);
  });
});

var calcStats = function (userCount) {
  var userStream = User.find().sort({reputation: -1}).stream();
  var counter = 0;
  var statInterval = Math.floor(userCount / 200);
  console.log("Inteval is", statInterval);

  userStream.on("data", function (user) {
    counter++;

    if (counter == 1 || counter % statInterval == 0) {
      var questionsAnswered = 0;  //todo WIP
      var acceptedVotes = 0;
      var upvotes = 0;
      var downvotes = 0;

      userStream.pause();

      Post.find({
        owneruserid: user.id,
        posttypeid: 2  //1 question, 2 answers
      }).exec(function (e, posts) {
        //var questionIdMap = {};
        //questionsAnswered = _.reduce(posts, function (post, questionCount) {
        //  if (!questionIdMap[0]) {
        //    questionIdMap[0]
        //  }
        //}, 0);

        var ids = _.pluck(posts, "id");
        var stream = Vote.find({postid: {$in: ids}}).stream();

        stream.on("data", function (vote) {
          if (vote.votetypeid == 1) {
            acceptedVotes += 1;
          } else if (vote.votetypeid == 2) {
            upvotes += 1;
          } else if (vote.votetypeid == 3) {
            downvotes += 1;
          }
        });

        stream.on("end", function () {
          console.log("User", user.displayname, user.id);
          console.log("Reputation:", user.reputation);
          console.log("acceptedVotes:", acceptedVotes);
          console.log("upvotes:", upvotes);
          console.log("downvotes:", downvotes, "\n");

          userStream.resume();
        });
      });
    }
  });
};

