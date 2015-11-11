"use strict";
var assert = require('assert');
var models  = require('./../../models');
var User  = models.User;
var encryptedPasswordLength = 60
describe('User', () => {
  describe('set encrypte password',  ()=>  {
    before((done) => {
      models.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });

    it('set encrypte password', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com"
      }
      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          assert.equal(error, undefined);
          done();
        })
    });
  });

  describe('unique email',  ()=>  {
    var attrs = {
      accountName: "DainisL",
      firstName: "Dainis",
      lastName: "Lapins",
      password: "cool_password",
      email: "dainis@gmail.com"
    }
    before((done) => {
      models.sequelize.sync({ force: true }).then(() => {
        User.build(attrs).save()
          .then(function(user) {
            done();
          });
      });
    });

    it('return unique validation error', (done) =>  {
      User.build(attrs).save()
        .then(function(user) {
          throw new Error("should not get there");
          done();
        })
        .catch(function(error) {
          assert.equal(error.errors[0].message, 'already taken');
          done();
        });
    });
  });

  describe('requiredEmail validation',  ()=>  {
    beforeEach((done) => {
      models.sequelize.sync({ force: true }).then(() => {
        done();
      });
    });

    it('set true', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "dainis@gmail.com",
        requiredEmail: true
      }
      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          assert.equal(error, undefined);
          done();
        })
    });

    it('set true and email is empty', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "",
        requiredEmail: true
      }

      User.build(attrs).save()
        .then(function(user) {
          throw new Error("should not get there");
          done();
        }).catch(function(error) {
          assert.equal(error.errors[0].message, 'is wrong format');
          done();
        })
    });

    it('set false', (done) =>  {
      let attrs = {
        accountName: "DainisL",
        firstName: "Dainis",
        lastName: "Lapins",
        password: "cool_password",
        email: "",
        requiredEmail: false
      }

      User.build(attrs).save()
        .then(function(user) {
          assert.equal(user.tipsAndUpdate, 'on');
          assert.equal(user.encryptedPassword.length, encryptedPasswordLength);
          done();
        }).catch(function(error) {
          throw new Error("should not get there");
          done();
        })
    });
  });
});
