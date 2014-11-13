var mongoose = require('mongoose');
var _ = require('underscore');
var db = require("./../connect").db();

var models = [
  require("../models/BadgeModel"),
  require("../models/PostLinkModel"),
  require("../models/PostModel"),
  require("../models/UnderdogModel"),
  require("../models/UserModel"),
  require("../models/VoteModel"),
  require("../models/TagModel")
];

db.once('open', function () {
  console.log('Connected to mongo server, tables:');

  mongoose.connection.db.collectionNames(function (error, names) {
    names.map(function (cname) {
      console.log("\t" + cname.name);
    });
    console.log("");
    _(models).each(function (model) {
      model.count(function (err, c) {
        console.log(model.modelName, "\t|\t", c)
      });
    });
  });
});
