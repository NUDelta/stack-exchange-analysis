module.exports = function(app){
  var home = function(req, res){
    res.render('index', {
      env: process.env.ENV,
      buildJS: process.env.buildJS,
      buildCSS: process.env.buildCSS
    });
  };

  app.get("/", home);
  app.get("/index", home);

  app.get("/bootstrapDemo", function(req, res){
    res.render('bootstrapDemo');
  });

  app.get("/sportsStore", function(req, res){
    res.render('sportsStore');
  });

  app.get("/admin", function(req, res){
    res.render('admin');
  });

  app.all("/*.jade", function(req,res){
    var file = req.originalUrl.split('/')[2];
    res.render('templates/' + file.split('.')[0]);
  });
};

