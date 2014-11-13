var db = require("./../connect").db();
var Post = require('./../models/PostModel');
var _ = require("underscore");

var rowCount = 0, i = 0;
var startTime = new Date().getTime();

var stream = Post.find({
  posttypeid: 1,
  acceptedanswerid: {$gt: 0}
}, {}, { timeout: false }).stream();

stream.on('data', function (post) {
  //this.pause()

  var self = this;
  Post.update({id: post.acceptedanswerid}, {accepted: true}, {}, function () {
    //if (i == 1) checkDelay();
    rowCount++;
    //i++;

    if(rowCount > 0 && rowCount % 100 == 0){
      var endTime = new Date().getTime();
      console.log(" | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")
    }
    //self.resume();
  });
});

var tempCount = 0;
var checkDelay = function () {
  setTimeout(function () {
    var endTime = new Date().getTime();

    if (rowCount > tempCount) {
      console.log(" | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")
      tempCount = rowCount;
      checkDelay();
    } else {
      console.log(rowCount + "All done! | Elapsed time: " + (endTime - startTime) / 1000 + " seconds, Rowcount: " + rowCount + " records.")
    }
  }, 5000);
};