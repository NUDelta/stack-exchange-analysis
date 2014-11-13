var mongoose = require('mongoose');
var config = require('./util/config');

module.exports = {
  db: function (dbname) {

    //mongoose.connect('mongodb://localhost/mathstack');
    mongoose.connect('mongodb://localhost/' + config.dbName);
    return mongoose.connection;
  }
};