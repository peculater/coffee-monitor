var async = require('async'),
    campfireHelper = require('./campfire');

exports.recentBrews = function(app, socket, manager) {
  manager.getRecentBrews(function(err, brews) {
    async.map(brews, function(brew, next) {
      app.render('includes/brew-single', {brew: brew}, next);
    }, function(err, results) {
      socket.emit('recentBrews', results.join(''));
    });
  });
};

exports.updateBrew = function(app, io, manager, brewId) {
  // TODO: there has to be a better way of getting all this darn state
  // and global stuff into here.
  manager.getBrew(brewId, function(error, brew) {
    async.parallel([
      function(next) {
        app.render('includes/brew-single', {brew: brew}, function(err, html) {
          if (err) {
            next(err);
            return;
          }
          io.sockets.emit('updateBrew', html);
          next(null);
        })
      },
      function(next) {
        campfireHelper.postBrew(brew, next);
      }
    ]);
  });
};


exports.updatePot = function(app, io, manager, potId) {
//Just copying from above
  manager.getPot(potId, function(error, pot) {
    async.parallel([
      function(next) {
        app.render('includes/pot-data', {pot: pot}, function(err, html) {
          if (err) {
            next(err);
            return;
          }
          io.sockets.emit('updatePot', html);
          next(null);
        })
      }
    ]);
  });
};

exports.deleteBrew = function(io, brewId) {
  io.sockets.emit('deleteBrew', brewId);
};
