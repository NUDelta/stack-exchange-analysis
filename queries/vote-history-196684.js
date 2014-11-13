var db = require("./../connect").db();
var VoteModel = require('./../models/VoteModel');
var PostModel = require("./../models/PostModel");
var _ = require("underscore");
var plotly = require('plotly')('y3sh', 'w9w6r6shwo');
var config = require("./../util/config");
var moment = require("moment");

var questionId = 196684;

PostModel.where({
  parentid: questionId,
  accepted: true
}).findOne().exec(function (err, acceptedPost) {
  //console.log("Accepted:", JSON.stringify(acceptedPost, null, 2));

  PostModel.where({
    parentid: questionId,
    accepted: false
  }).findOne().sort({score: -1}).exec(function (err, underdogPost) {
    //console.log("Underdog:", JSON.stringify(underdogPost, null, 2));

    VoteModel.find({postid: acceptedPost.id}).sort({creationdate: 1}).exec(function (err, acceptedPostVotes) {
      var votesDatesAccepted = _.reduce(acceptedPostVotes, voteReducer, [], {
        iterSum: 0,
        accepted: 0
      });
      console.log("Accepted history:\n\n", JSON.stringify(votesDatesAccepted, null, 2));

      VoteModel.find({postid: underdogPost.id}).sort({creationdate: 1}).exec(function (err, underdogPostVotes) {
        var votesDatesUnderdog = _.reduce(underdogPostVotes, voteReducer, [], {
          iterSum: 0,
          acceptedVotes: 0,
          acceptedDate: ""
        });
        console.log("Underdog history:\n\n", JSON.stringify(votesDatesUnderdog, null, 2));

        plot(votesDatesAccepted, votesDatesUnderdog);
      });
    });
  });
});

var voteReducer = function (arr, vote) {
  if (vote.votetypeid > 0 && vote.votetypeid < 4) {
    this.iterSum += vote.votetypeid == 2 ? 1 : vote.votetypeid == 3 ? -1 : 0;
    if (!this.acceptedVotes && vote.votetypeid == 1) {
      this.acceptedVotes = this.iterSum;
      this.acceptedDate = moment(vote.creationdate).format("YY-MM-DD hh:mm:ss");
    }

    arr.push({
      voteSum: this.iterSum,
      date: moment(vote.creationdate).format("YY-MM-DD hh:mm:ss"),
      acceptedVotes: this.acceptedVotes,
      acceptedDate: this.acceptedDate
    });
  }

  return arr;
};

var plot = function (votesDatesAccepted, votesDatesUnderdog) {
  var trace1 = {
    x: _.pluck(votesDatesAccepted, 'date'),
    y: _.pluck(votesDatesAccepted, 'voteSum'),
    name: "Accepted Solution",
    type: "scatter"
  };
  var trace2 = {
    x: _.pluck(votesDatesUnderdog, 'date'),
    y: _.pluck(votesDatesUnderdog, 'voteSum'),
    name: "Underdog Solution",
    type: "scatter"
  };
  var layout = {
    title: "Accepted Solution and Underdog vs Time",
    xaxis: {
      title: "Date",
      type: "date",
      nticks: 10
    },
    yaxis: {
      title: "Votes",
      type: "linear"
    },
    annotations: [{
      x: _.last(votesDatesAccepted).acceptedDate,
      y: _.last(votesDatesAccepted).acceptedVotes,
      xref: "x",
      yref: "y",
      text: "Solution Accepted",
      showarrow: true,
      arrowhead: 7,
      ax: 0,
      ay: -40
    }]
  };

  var data = [trace1, trace2];
  var graph_options = {
    filename: config.dbName + "-underdog-accepted-line-qId-" + questionId,
    fileopt: "overwrite",
    layout: layout
  }
  plotly.plot(data, graph_options, function (err, msg) {
    console.log(msg);
  });
};