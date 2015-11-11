"use strict";
var express = require('express');
var router = express.Router();
var users_repo = require('./../repositories/users.js');
var passport = require('passport');


router.use(function (req, res, next) {
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '', user: req.user });
});

router.get('/registration', function(req, res, next) {
  res.render('registration', users_repo.prepareParams(req));
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
            res.redirect("/")
          });
        };
      });
    };
  });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));

router.get('/login', function(req, res, next) {
  res.render('login', { user: req.user, title: 'Login', error: ""});
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;
