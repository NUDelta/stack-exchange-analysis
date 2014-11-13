var db = require("./../connect").db();
var VoteModel = require('./../models/VoteModel');
var PostModel = require("./../models/PostModel");
var _ = require("underscore");
var EventEmitter = require('events').EventEmitter;

PostModel.where({
  parentid: 196684,
  accepted: true
}).findOne().exec(function (err, acceptedPost) {
  //console.log("Accepted:", JSON.stringify(acceptedPost, null, 2));

  PostModel.where({
    parentid: 196684,
    accepted: false
  }).findOne().sort({score: -1}).exec(function (err, underdogPost) {
    //console.log("Underdog:", JSON.stringify(underdogPost, null, 2));

    VoteModel.find({postid: acceptedPost.id}).sort({creationdate: 1}).exec(function (err, acceptedPostVotes) {
      var votesDatesAccepted = _.reduce(acceptedPostVotes, voteReducer, [], {
        iterSum: 0,
        accepted: 0
      });
      //console.log("Accepted history:\n\n", JSON.stringify(votesDatesAccepted, null, 2));

      VoteModel.find({postid: underdogPost.id}).sort({creationdate: 1}).exec(function (err, underdogPostVotes) {
        var votesDatesUnderdog = _.reduce(underdogPostVotes, voteReducer, [], {
          iterSum: 0,
          accepted: 0
        });
        console.log("Underdog history:\n\n", JSON.stringify(votesDatesUnderdog, null, 2));
      });
    });
  });
});

var voteReducer = function (arr, vote) {
  if (vote.votetypeid > 0 && vote.votetypeid < 4) {
    this.iterSum += vote.votetypeid == 2 ? 1 : vote.votetypeid == 3 ? -1 : 0;
    if (!this.accepted && vote.votetypeid == 1) {
      this.accepted = this.iterSum;
    }

    arr.push({
      voteSum: this.iterSum,
      creationdate: vote.creationdate,
      accepted: this.accepted
    });
  }

  return arr;
};
