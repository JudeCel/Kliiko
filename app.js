"use strict";
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var config = require('config');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var usersRepo = require('./repositories/users.js');
var User  = usersRepo.user;
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', { layout: 'layout.ejs' });

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.get("cookie_secret")));
app.use(express.static(path.join(__dirname, 'public')));


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
  },
  function(username, password, done) {
    usersRepo.compare_password(username, password, function(failed, result) {
      if (failed) {
        return done(null, false);
      }else{
        return done(null, result);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, {id: user.id, email: user.email, display_name: user.display_name});
});

passport.deserializeUser(function(id, done) {
  User.find({where: {id: id}}).done(function(result){
    if (result) {
      done(null, {id: result.id, email: result.email, display_name: result.display_name});
    }else{
      done("not found", null);
    };
  });
});

app.use(session({
    store: new RedisStore(config.get("redis_session")),
    secret: config.get("session_secret"),
    resave: true, saveUninitialized: false,
    cookie: { secure: true, maxAge: 600000 }
}));

app.use(passport.initialize());
app.use(passport.session());

var routes = require('./routes/root');
app.use('/', routes);

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


module.exports = app;
