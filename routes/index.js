var async = require('async'),
    passport = require('passport');

exports.recentBrews = function(req, res) {
  req.manager.getRecentBrews(function(error, brews) {
    res.render('recent-brews', { 'title': 'Recent Brews', 'brews': brews });
  });
};

function fourohfour(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(404, 'Not implemented yet');
}


// Coffee Makers

exports.makerDetail = fourohfour;

exports.makerAdd = function(req, res) {
  res.render('maker-add', {
    'title': 'Add Coffee Maker'
  });
};

exports.makerAddSubmit = function(req, res) {
  req.assert('name').notEmpty();
  req.assert('brewTime').notEmpty().isInt().min(0).max(1800);

  var errors = req.validationErrors();
  if(errors) {
    res.set('Content-Type', 'text/plain');
    res.send(400, 'Validation failed!\n' + require('util').inspect(errors));
    return;
  }

  var name = req.sanitize('name').trim();
  var brewTime = req.sanitize('brewTime').toInt();
  var maker = {
    name: name,
    brewTime: brewTime,
    active: 1,
    createdAt: Date.now(),
  };

  req.manager.addMaker(maker, function(err, maker) {
    res.redirect('/makers/' + maker.id);
  });
};

exports.makerDelete = function(req, res) {
  req.manager.deleteMaker(req.params.id, function(err) {
    res.send(204, null);
  });
};

exports.makers = fourohfour;


// Pots

exports.potDetail = fourohfour;

exports.potAdd = function(req, res) {
  res.render('pot-add', {
    'title': 'Add Coffee Pot'
  });
};

exports.potAddSubmit = function(req, res) {
  req.assert('name').notEmpty();
  req.assert('color').isIn(['black', 'blue', 'green', 'red', 'white']);

  var errors = req.validationErrors();
  if(errors) {
    res.set('Content-Type', 'text/plain');
    res.send(400, 'Validation failed!\n' + require('util').inspect(errors));
    return;
  }

  var name = req.sanitize('name').trim();
  var color = req.sanitize('color').trim();
  var pot = {
    name: name,
    color: color,
    active: 1,
    createdAt: Date.now(),
  };

  req.manager.addPot(pot, function(err, pot) {
    res.redirect('/pots/' + pot.id);
  });
};

exports.potDelete = function(req, res) {
  req.manager.deletePot(req.params.id, function(err) {
    res.send(204, null);
  });
};
exports.pots = fourohfour;


// Brews

exports.brewDetail = function(req, res) {
  req.manager.getBrew(req.params.id, function(error, brew) {
    if(!brew) {
      res.set('Content-Type', 'text/plain');
      res.send(404, 'Brew not found');
    } else {
      res.render('brew-detail', { 'title': 'Brew ' + req.params.id, 'brew': brew });
    }
  });
};

exports.brewDelete = function(req, res) {
  req.manager.deleteBrew(req.params.id, function(err) {
    res.send(204, null);
  });
};

exports.brewAdd = function(req, res) {
  var man = req.manager;
  async.parallel(
    [man.getMakers.bind(man), man.getPots.bind(man)],
    function(err, results) {
      res.render('brew-add', {
        'title': 'Add Brew',
        'makers': results[0],
        'pots': results[1]
      });
    });
};

exports.brewAddSimple = function(req, res) {
  var man = req.manager;
  async.parallel(
    [man.getMakers.bind(man), man.getPots.bind(man)],
    function(err, results) {
      res.render('brew-add-buttons', {
        'title': 'Add Brew',
        'makers': results[0],
        'pots': results[1]
      });
    });
};

exports.brewAddSubmit = function(req, res) {
  req.assert('maker').notEmpty().isInt();
  // accept either '1' or '1-start' or '1-finish'
  req.assert('pot').notEmpty().is(/^\d+(-(start|finish))?$/);

  var errors = req.validationErrors();
  if(errors) {
    res.set('Content-Type', 'text/plain');
    res.send(400, 'Validation failed!\n' + require('util').inspect(errors));
    return;
  }

  var maker = req.sanitize('maker').toInt();
  var potParts = req.param('pot').split('-');
  var brew = {
    makerId: maker,
    potId: parseInt(potParts[0], 10),
    creationIp: req.ip,
  };
  if (potParts.length > 1 && potParts[1] === 'finish') {
    brew.readyAt = Date.now();
  } else {
    brew.createdAt = Date.now();
  }

  req.manager.addBrew(brew, function(err, brew) {
    if (err) {
      res.set('Content-Type', 'text/plain');
      res.send(400, 'Error!\n' + err);
      return;
    }
    //res.redirect('/brews/' + brew.id);
    res.redirect('/');
  });
};

exports.brewUpdate = function(req, res) {
  //req.assert('brewInfo').notEmpty();
  
  var errors = req.validationErrors();
  if(errors) {
    res.set('Content-Type', 'text/plain');
    res.send(400, 'Validation failed!\n' + require('util').inspect(errors));
    return;
  }

  res.set('Content-Type', 'text/plain');
  res.send(200, req.data);
  //Validate JSON
  //var update = JSON.parse(req.data);
  
  
  
  //Pull data out of JSON
  
  //Persist the current status
  

//If this represents a new pot  
  /*var brew = {
    makerId: maker,
    potId: parseInt(potParts[0], 10),
    creationIp: req.ip,
  };
    brew.readyAt = Date.now();
  req.manager.addBrew(brew, function(err, brew) {
    if (err) {
      res.set('Content-Type', 'text/plain');
      res.send(400, 'Error!\n' + err);
      return;
    }
    //res.redirect('/brews/' + brew.id);
    res.redirect('/');
  });
  */
};

exports.brews = fourohfour;


// Authentication

exports.login = function(req, res) {
  res.render('login', {
    'title': 'Login',
  });
};

exports.loginSubmit = function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })(req, res, next);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};


// Other

exports.teapot = function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send(418, 'I\'m a teapot');
}

exports.qr = function(req, res) {
  res.render('qr', {
    'title': 'Coffee Monitor',
  });
};
