var _ = require("underscore");
var plotly = require('plotly')('y3sh', 'w9w6r6shwo');
var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var Underdog = require("./../models/UnderdogModel");
var _ = require("underscore");
var config = require("./../util/config")

var maxViews = 2000000;
var viewCountRange = maxViews / 500;
var countMap = {};
var startTime = new Date().getTime();

Underdog.find({}).populate('parent').exec(function (e, counts) {
  Post.find({
    viewcount: {$gt: 0},
    answercount: {$gt: 0}
  }).exec(function (e, countsInner) {
    plot(_.pluck(countsInner, 'viewcount'), _(_.pluck(counts, 'parent')).pluck('viewcount'));
  });
});

var plot = function (countsPost, countsUnderdog) {
  var xOnes = [];
  for (var i = 0; i < countsPost.length; i++) {
    xOnes.push(1);
  }

  var xTwos = [];
  for (var i = 0; i < countsUnderdog.length; i++) {
    xTwos.push(2);
  }

  var trace1 = {
    x: xOnes,
    y: countsPost,
    mode: "markers",
    name: "Posts",
    marker: {
      color: "rgb(164, 194, 244)",
      size: 6,
      line: {
        color: "white",
        width: 0.5
      }
    },
    type: "scatter"
  };

  var trace2 = {
    x: xTwos,
    y: countsUnderdog,
    mode: "markers",
    name: "Underdogs",
    marker: {
      color: "rgb(255, 217, 102)",
      size: 6,
      line: {
        color: "white",
        width: 0.5
      }
    },
    type: "scatter"
  };

  var data = [trace1, trace2];
  var layout = {
    title: "Post(1) Underdog(2)",
    xaxis: {
      title: "",
      range: [0, 10],
      showgrid: false,
      zeroline: false,
      showticklabels: false
    },
    yaxis: {
      title: "Views",
      range: [0, 100],
      showline: false
    }
  };
  var graph_options = {
    layout: layout,
    filename: config.dbName + "-post-underdog-viewcount-scatter",
    fileopt: "overwrite"
  }
  plotly.plot(data, graph_options, function (err, msg) {
    console.log(msg);
  });
};
