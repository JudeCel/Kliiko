"use strict";
var User  = require('./../models').User;
var _ = require('lodash');
var bcrypt = require('bcrypt');

function create(params, callback) {
  validateForCreate(params, function(error, user) {
    if (Object.keys(error).length > 1) {
      return callback(error, user)
    } else {
      createUser(params, function(error, result) {
        if (Object.keys(error).length > 1) {
          return callback(error, result);
        }else {
          return callback(null, result);
        }
      })
    }
  })
};

function createUser(params, callback) {
  User.create(params).then(function(result) {
    return callback(null, result);
  }).catch(User.sequelize.ValidationError, function(err) {
    return callback(prepareErrors(err), this);
  }).catch(function(err) {
    return callback(prepareErrors(err), this);
  });
}


function validateVirtualAttrs(params){
  let errors = {}
  return errors;
}

function validateForCreate(params, callback){
  let errorsObject = validateVirtualAttrs(params)
  User.build(params).validate().done(function(errors, user) {
    if (errors) {
      errorsObject = prepareErrors(errors, {});
      callback(errorsObject, this);
    }else{
      callback(errorsObject, user);
    }
  });
}

function comparePassword(email, password, callback) {
  User.find({where: {email: email}}).done(function(result){
    if (result) {
      bcrypt.compare(password, result.encryptedPassword, function(err, res) {
        if (err) { return callback(true, null) }
        if (res == true) {
          callback(null, result);
        } else {
          callback(true, null);
        }
      });
    }else {
      callback(true, null);
    };
  });
};

function prepareErrors(err, _errors_object) {
  let errors = (_errors_object || {})
  _.map(err.errors, function(n) {
    errors[n.path] = _.startCase(n.path) +" " + n.message;
  });
  return errors
};
function prepareParams(req, errors) {
  return _.assign({
    user: req.user,
    title: 'Registration',
    accountName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    tipsAndUpdate: 'on',
    errors: (errors || {})
  }, req.body, req.query);
}

module.exports = {
    create: create,
    user: User,
    createUser: createUser,
    comparePassword: comparePassword,
    prepareParams: prepareParams
}
