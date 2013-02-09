var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    redis = require('redis'),
    socketIo = require('socket.io'),
    brewmanager = require('./brewmanager-redis');

var db = redis.createClient();
db.select(6);

var manager = new brewmanager.BrewManager();

function setupBrewManager(req, res, next) {
  req.manager = manager;
  next();
}

function ipTracker(req, res, next) {
  db.zadd('online', Date.now(), req.ip, next);
}

var app = express();
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(ipTracker);
  app.use(setupBrewManager);
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

var io = socketIo.listen(server);
io.configure(function() {
  // TODO: eventually store client data in Redis
  // https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
  io.set('log level', 2);
});
io.sockets.on('connection', function(socket) {
  manager.getRecentBrews(function(err, brews) {
    app.render('single_brew', {brew: brews[0]}, function(err, html) {
      console.log(err);
      console.log(html);
      socket.emit('news', html);
    });
  });
});
