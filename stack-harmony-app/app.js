var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');


var file = __dirname + '/build.json';
fs.readFile(file, 'utf8', function (err, data) {
  if (!err) {
    var o = JSON.parse(data);
    process.env.buildJS = o.buildJS;
    process.env.buildCSS = o.buildCSS;
    console.dir(data);
  } else {
    process.env.buildJS = "";
    process.env.buildCSS = "";
  }
});

var app = express();

if (process.env.ENV === "prod") {
  app.set('port', 80);
} else {
  app.set('port', 3000);

  var lessMiddleware = require('less-middleware');
  app.use(lessMiddleware(path.join(__dirname, 'public')));
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

require('./routes/pages')(app);
require('./routes/services')(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});