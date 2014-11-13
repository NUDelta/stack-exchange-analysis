var db = require("./../connect").db();
var Post = require("./../models/PostModel");
var Underdog = require("./../models/UnderdogModel");
var _ = require("underscore")

var startTime = new Date().getTime();

var runQuery = function () {
  Post.aggregate([
    {
      $match: {
        posttypeid: 2
      }
    },
    {
      $group: {
        _id: "$parentid",
        answers: {
          $addToSet: {
            id: "$id",
            accepted: "$accepted",
            score: "$score",
            parentid: "$parentid",
            owneruserid: "$owneruserid",
            creationdate: "$creationdate"
          }
        }
      }
    },
    {
      $match: {
        'answers.accepted': {$eq: true},
        'answers.0': {$exists: true}
      }
    },
    {$unwind: '$answers'},
    {$sort: {'answers.score': -1}},
    {
      $group: {
        _id: "$_id",
        topAnswer: {
          $first: '$answers'
        }
      }
    },
    {
      $match: {
        'topAnswer.accepted': {$eq: false},
        'topAnswer.score': {$gt: 0}
      }
    },
    {$sort: {'topAnswer.score': -1}},
    {
      $project: {
        _id: 0,  //remove _id
        "parentQuestionId": "$topAnswer.parentid",
        "answerId": "$topAnswer.id",
        "score": "$topAnswer.score",
        "ownerUserId": "$topAnswer.owneruserid",
        "creationDate": "$topAnswer.creationdate"
      }
    },
    {
      $out: "underdogs"
    }


  ]).allowDiskUse(true).exec(function () {
    var endTime = new Date().getTime();
    console.log("Finished aggregate in " + (endTime - startTime) / 1000 + " seconds.");
  });
};

runQuery();