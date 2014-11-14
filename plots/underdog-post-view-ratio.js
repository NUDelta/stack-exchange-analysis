var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var Underdog = require('./../models/UnderdogModel');
var _ = require("underscore");
var maxViews = 2000000;
var buckets = 100;
var viewCountRange = maxViews / buckets;
var plotly = require('plotly')('y3sh', 'w9w6r6shwo');
var config = require("./../util/config");


var postStream = function () {

  var countMap = {};
  var startTime = new Date().getTime();
  var stream = Post.find({
    posttypeid: 1
  }).stream();

  var rowCount = 0;
  stream.on('data', function (post) {
    var key = Math.ceil(post.viewcount / viewCountRange);

    if (countMap[key]) {
      countMap[key] = countMap[key] + 1;
    } else {
      countMap[key] = 1;
    }

    rowCount++;
    if (rowCount % 25000 == 0) {
      console.log(JSON.stringify(countMap, null, 2));
    }
  });
  stream.on('end', function (post) {
    var endTime = new Date().getTime();
    console.log(rowCount + "All done! | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")
    console.log("Post distribution:");
    console.log(JSON.stringify(countMap, null, 2));

    underdogStream(countMap)
  });
};

var underdogStream = function (postCountMap) {
  var startTime = new Date().getTime();
  var stream = Underdog.find({}).populate("parent").stream();
  var underdogCountMap = {};

  var rowCount = 0;
  stream.on('data', function (post) {
    var key = Math.ceil(post.parent.viewcount / viewCountRange);

    if (underdogCountMap[key]) {
      underdogCountMap[key] = underdogCountMap[key] + 1;
    } else {
      underdogCountMap[key] = 1;
    }

    rowCount++;
    if (rowCount % 25000 == 0) {
      console.log(JSON.stringify(underdogCountMap, null, 2));
    }
  });
  stream.on('end', function (post) {
    var endTime = new Date().getTime();
    console.log(rowCount + "All done! | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.");
    console.log("Post distribution:");
    console.log(JSON.stringify(underdogCountMap, null, 2));

    var finalMap = {};
    _(_.keys(postCountMap)).each(function (key) {
      if (underdogCountMap[key] != null && underdogCountMap[key] >= 5) {
        finalMap[key] = underdogCountMap[key] / postCountMap[key]
      }
    });

    console.log(JSON.stringify(finalMap, null, 2));
    plot(finalMap);
  });
};

var plot = function (finalMap) {
  var trace1 = {
    x: _(_.keys(finalMap)).map(function (p) {
      return p * 4000
    }),
    y: _(_.values(finalMap)).map(function (p) {
      return p
    }),
    name: "All Questions",
    marker: {color: "rgb(55, 83, 109)"},
    type: "scatter"
  };
  var data = [trace1];
  var layout = {
    title: "Percentage of underdogs vs question popularity",
    xaxis: {
      title: "View Count (Popularity)",
      tickfont: {
        size: 14,
        color: "rgb(107, 107, 107)"
      }
    },
    yaxis: {
      title: "Percentage of Underdog Answers",
      titlefont: {
        size: 16,
        color: "rgb(107, 107, 107)"
      },
      tickfont: {
        size: 14,
        color: "rgb(107, 107, 107)"
      }
    },
    legend: {
      x: 0,
      y: 1.0,
      bgcolor: "rgba(255, 255, 255, 0)",
      bordercolor: "rgba(255, 255, 255, 0)"
    },
    barmode: "group",
    bargap: 0.15,
    bargroupgap: 0.1
  };
  var graph_options = {
    layout: layout,
    filename: config.dbName + "-post-underdog-ratio-bar-2",
    fileopt: "overwrite"
  }
  plotly.plot(data, graph_options, function (err, msg) {
    console.log(msg);
  });
};

postStream();