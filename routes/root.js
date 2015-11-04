"use strict";
var express = require('express');
var async = require('async');
var router = express.Router();
var users_repo = require('./../repositories/users');
var passport = require('passport');
var subdomains = require('../lib/subdomains');
var config = require('config');
var mailers = require('../mailers');
var session = require('../middleware/session')

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

router.route('/forgotpassword')
  .get( function(req, res, next) {
    res.render('forgotpassword', { title: 'Forgot your password?', email: '', error: '', success: ''});
  })
  .post( function(req, res, next) {

    var error = '';
    var success = '';
    var title = 'Forgot your password?';
    var email = req.body.email;

    if (email) {

      async.waterfall([
        function(next) {
          users_repo.setResetToken(email, next);
        },
        function(token, next) {

          if(!token) return next();

          var params = {
            token: token,
            email: email
          };

          mailers.users.sendResetPasswordToken(params, next);
        }
      ], function(err ) {
        if (err) {
          error = 'Failed to send data. Please try later';
        }else {
          success = 'Account recovery email sent to ' + email;
        }

        res.render('forgotpassword', { title: title, email: email, error: error, success: success});
      });

    }else{
      error = 'Please fill e-mail fields';
      res.render('forgotpassword', { title: title, email: email, error: error, success: success});
    }
  });

router.route('/resetpassword/:token')
  .get(function(req, res, next) {

    users_repo.getUserByToken(req.params.token, function(err, user){

      if (err) return  next();

      var tokenCreated = new Date(user.get("resetPasswordSentAt"));
      var tokenEnd = tokenCreated.setHours(tokenCreated.getHours() + 24);
      var now = new Date().getTime();
      if ( now > tokenEnd) {
        user = null;
      }

      res.render('resetpassword', { title: 'Reset password', user: user, token: req.params.token, errors: {}});
    });

  }).post( function(req, res, next) {

    if ( !req.params.token || !req.body.password ) return  next();

    users_repo.getUserByToken(req.params.token, function(err, user){

      if (err) return  next();

      users_repo.resetPassword(req.params.token, req.body.password, function(err, data){

        if (err) {
           res.render('resetpassword', { title: 'Reset password', user: user, token: req.params.token, errors: {password : err.message}});
        } else {
          mailers.users.sendResetPasswordSuccess({email: user.get('email')}, function(err, data){
            res.redirect("/login");
          });
        }
      });
    });
  });

module.exports = router;
