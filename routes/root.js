"use strict";
var express = require('express');
var router = express.Router();
var users_repo = require('./../repositories/users.js');
var passport = require('passport');
var subdomains = require('../lib/subdomains.js');
var session = require('../middleware/session.js');

router.use(function (req, res, next) {
  if (req.path == '/logout') {
    return next();
  }

  if (req.user && (req.path.indexOf('dashboard') == -1) ) {
    res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
  }else{
    next();
  }
});

/* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('login', { title: 'Login',user: req.user, error: ""});
//});

//router.get('/', function(req, res, next) {
//  res.render('login', { title: 'Login', user: req.user, error: ""});
//});

router.get('/', function(req, res, next) {
  res.render('dashboard/dashboard', { title: 'Dashboard', user: req.user, error: ""});
});
router.get('/registration', function(req, res, next) {
  res.render('registration', users_repo.prepareParams(req));
});
router.get('/landing', function(req, res, next) {
  res.render('landing', { title: 'landing', user: req.user });
});
router.post('/registration', function(req, res, next) {
  users_repo.create(users_repo.prepareParams(req), function(error, result) {
    if (error) {
      res.render('registration', users_repo.prepareParams(req, error));
    }else{
      users_repo.comparePassword(result.email, result.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect(subdomains.url(req, result.accountName, '/dashboard'))
          });
        };
      });
    };
  });
});

router.post('/login', function(req, res, next) {
 var post = req.body;
      users_repo.comparePassword(post.email, post.password, function(failed, result) {
        if (failed) {
          res.render('login', { title: 'Login', error: "Wrong email or password"})
        }else{
          req.login(result, function(err) {
            res.redirect(subdomains.url(req, result.accountName, '/landing'))
          });
        };
      });

});

router.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {failureRedirect: '/login' }),
  function(req, res) {
    res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
  }
);

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login', error: ""});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res, next) {
    session.rememberMe(req, function(err, result) {
      if (err) { throw err}
      if (result) {
        res.redirect(subdomains.url(req, req.user.accountName, '/dashboard'));
      }
    })
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect(subdomains.url(req, 'insider', '/'));
});


module.exports = router;
