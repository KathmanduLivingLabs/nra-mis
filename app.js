var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var app = express();

var authorize = require('./libs/authorize');

try {
  var cronJob = require('./cron');

  if(!cronJob.running){
    
    cronJob.start(); //start cron job
  }

}

catch(e){
  console.log(e);
}

app.put('/management/cron/stop',authorize.auth,function(req,res){
  cronJob.stop();
  console.log('******** Cron status : ',cronJob.running)
  return res.json({
    status : cronJob.running
  })
})

app.put('/management/cron/start',authorize.auth,function(req,res){
  if(!cronJob.running){
    cronJob.start(); //start cron job
    console.log('******** Cron status : ',cronJob.running)
  }
  return res.json({
    status : cronJob.running
  })
})



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '/apidocs')));
app.use(express.static(path.join(__dirname, 'public')));

var config = require('./config');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
  next();
});

var router = express.Router();
app.use('/',router);

require('./controllers')(router);

var versions = config.versions;


for(var version in versions){
    require('./controllers'+ versions[version])(router);    
}

global['winstonLogger'] = require('./winston-config');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var port = 8848;

var models = require("./models");


models.sequelize.sync().then(function(){
  var listener =  app.listen(process.env.PORT || port,function(){
      console.log('Server running at port ' +  listener.address().port)
  })

})


module.exports = app;
