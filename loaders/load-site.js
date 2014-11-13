var _ = require('underscore');
var db = require("./../connect").db();
var sax = require("sax");
var fs = require("fs");
var cluster = require('cluster');
var config = require('../util/config');

var BadgeModel = require("../models/BadgeModel"),
  PostLinkModel = require("../models/PostLinkModel"),
  PostModel = require("../models/PostModel"),
  TagModel = require("../models/TagModel"),
  UnderdogModel = require("../models/UnderdogModel"),
  UserModel = require("../models/UserModel"),
  VoteModel = require("../models/VoteModel");
var models = [
  BadgeModel,
  PostLinkModel,
  PostModel,
  TagModel,
  UserModel,
  VoteModel
];

var loadCollection = function (dir, Model) {
  var rowCount = 0;

  Model.remove({}, function () {
    var stream = sax.createStream(false, {lowercasetags: true});

    var startTime = new Date().getTime();
    var acceptedIds = [];

    stream.on("opentag", function (tag) {
      var rowObj = tag.attributes;

      if (Model.modelName == "Post") {
        if (!rowObj.id || (rowObj.posttypeid != 2 && rowObj.posttypeid != 1)) {
          return;
        }

        delete rowObj.body;
        delete rowObj.title;

        //Assumes posts are in order, where questions are before answers (questionId lower than answerId)
        if (rowObj.posttypeid == 1 && rowObj.acceptedanswerid) {
          acceptedIds.push(rowObj.acceptedanswerid)
        }

        if (rowObj.posttypeid == 2) {
          var idIndex = acceptedIds.indexOf(rowObj.id);
          if (idIndex > -1) {
            rowObj.accepted = true;
            acceptedIds.splice(idIndex, 1);
          }
        }
      }

      var model = new Model(rowObj);
      model.save(function (err, p) {
        if (rowCount > 1 && rowCount % 100000 == 0) {
          var endTime = new Date().getTime();
          console.log(Model.modelName, " | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")
        }
        rowCount++;
      });
    });

    stream.on("end", function () {
      var tempCount = rowCount;

      var checkDelay = function () {
        setTimeout(function () {
          if (rowCount > tempCount) {
            //console.log("Waiting on mongo", tempCount, rowCount)
            tempCount = rowCount;
            checkDelay();
          } else {
            console.log(Model.modelName, " | " + rowCount + " Records | All done! ");
          }
        }, 1000);
      };

      checkDelay();
    });

    var fstr = fs.createReadStream(dir, {encoding: "utf8"});
    fstr.pipe(stream);
  });
};

if (cluster.isMaster) {
  _(models).each(function (Model, i) {
    cluster.fork({
      "modelIndex": i
    });
  });
} else {
  var modelIndex = process.env['modelIndex'];
  var Model = models[modelIndex]
  var xModel = new Model()

  var file = config.xmlDir + xModel.xml;
  loadCollection(file, Model);
  console.log('Forked loader for: ' + file);
}

//loadCollection("/opt/stack-exchange-data/beer.stackexchange.com/Tags.xml", TagModel);