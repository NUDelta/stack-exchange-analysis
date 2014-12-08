var db = require("./../connect").db();
var Underdog = require('./../models/UnderdogModel');
var Post = require('./../models/PostModel');
var User = require('./../models/UserModel');
var config = require('./../util/config');
var _ = require("underscore");
var plotly = require('plotly')('y3sh', 'w9w6r6shwo');

//For the Top Underdogs questions, what is the distribution of the authors' reputations
Underdog.find().exec(function (err, underdogs) {
  var ownerIds = _(_(underdogs).pluck("ownerUserId")).without(undefined);

  User.find({id: {$in: ownerIds}}).exec(function (err, users) {
    var reputations = _(users).pluck("reputation");
    reputations = _(reputations).without(null);

    var data = [
      {
        x: reputations,
        type: "histogram"
      }
    ];
    var graph_options = {filename: config.dbName + "-underdog-provider-reputation-histogram", fileopt: "overwrite"}
    plotly.plot(data, graph_options, function (err, msg) {
      console.log(msg);
    });
  });
});


//For the Top Questions, what is the reputation of users that asked them
Post.find({posttypeid: 1}).sort({score: -1}).limit(1000).exec(function (err, posts) {
  var ownerIds = _(_(posts).pluck("owneruserid")).without(undefined);

  User.find({id: {$in: ownerIds}}).exec(function (err, users) {
    var reputations = _(users).pluck("reputation");
    reputations = _(reputations).without(null);

    var data = [
      {
        x: reputations,
        type: "histogram"
      }
    ];
    var graph_options = {filename: config.dbName + "-top-questions-author-reputation-histogram", fileopt: "overwrite"};
    plotly.plot(data, graph_options, function (err, msg) {
      console.log(msg);
    });
  });
});


//For the Top Answers, what is the reputation of users that provided them
Post.find({posttypeid: 2}).sort({score: -1}).limit(1000).exec(function (err, posts) {
  var ownerIds = _(_(posts).pluck("owneruserid")).without(undefined);

  User.find({id: {$in: ownerIds}}).exec(function (err, users) {
    var reputations = _(users).pluck("reputation");

    var data = [
      {
        x: reputations,
        type: "histogram"
      }
    ];
    var graph_options = {filename: config.dbName + "-top-answers-author-reputation-histogram", fileopt: "overwrite"};
    plotly.plot(data, graph_options, function (err, msg) {
      console.log(msg);
    });
  });
});

//For the Top Underdogs, what are the tags
Underdog.find().populate("parent").sort({score: -1}).limit(1000).exec(function (err, underdogs) {
  var tagCounts = {};

  _(underdogs).each(function (underdog) {
    var post = underdog.parent;
    var tagArr = post.tags.substring(1, post.tags.length - 1).split("><");

    _(tagArr).each(function (tag) {
      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });
  });

  var tagsToPlot = _.chain(tagCounts).pairs().sortBy(function (pair) {
    return -pair[1];
  }).first(20).object().value();

  var data = [
    {
      x: _(tagsToPlot).keys(),
      y: _(tagsToPlot).values(),
      type: "bar"
    }
  ];
  var graph_options = {filename: config.dbName + "-top-underdog-tags", fileopt: "overwrite"}
  plotly.plot(data, graph_options, function (err, msg) {
    console.log(msg);
  });
});

//For the Top Questions, what are the tags
Post.find({posttypeid: 1}).sort({score: -1}).limit(1000).exec(function (err, posts) {
  var tagCounts = {};

  _(posts).each(function (post) {
    var tagArr = post.tags.substring(1, post.tags.length - 1).split("><");

    _(tagArr).each(function (tag) {
      if(tag == "c++"){
        tag = "c-plus-plus"
      }

      if (tagCounts[tag]) {
        tagCounts[tag]++;
      } else {
        tagCounts[tag] = 1;
      }
    });

  });

  var tagsToPlot = _.chain(tagCounts).pairs().sortBy(function (pair) {
    return -pair[1];
  }).first(20).object().value();

  var data = [
    {
      x: _(tagsToPlot).keys(),
      y: _(tagsToPlot).values(),
      type: "bar"
    }
  ];
  var graph_options = {filename: config.dbName + "-top-questions-tags", fileopt: "overwrite"}
  plotly.plot(data, graph_options, function (err, msg) {
    console.log(msg);
  });
});

//Point distribution over the population (who has the most points)
// x is percent from 1 to 100%
// y is total points for that percent
User.count({}, function (err, userCount) {

  var stream = User.find().sort({reputation: 1}).stream();

  var interval = Math.ceil(userCount / 100);
  var percentPoints = {};
  var percent = 1;
  var i = 0;

  stream.on('data', function (user) {
    i++;

    if (percentPoints[percent] === undefined) {
      percentPoints[percent] = 0;
    } else {
      if (user.reputation) {
        percentPoints[percent] += user.reputation;
      }
    }

    if (i == interval) {
      percent++;
      i = 0;
    }
  });

  stream.on('end', function () {
    var data = [
      {
        x: _(percentPoints).keys(),
        y: _(percentPoints).values(),
        type: "bar"
      }
    ];
    var graph_options = {filename: config.dbName + "-point-distribution-over-population", fileopt: "overwrite"}
    plotly.plot(data, graph_options, function (err, msg) {
      console.log(msg);
    });

    var totalPoints = _.reduce(_(percentPoints).values(), function (memo, num) {
      return memo + num;
    }, 0);
    console.log(JSON.stringify(percentPoints, null, 2));
    console.log("Total points: " + totalPoints)
  });
});