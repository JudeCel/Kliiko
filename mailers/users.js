var nodemailer = require('nodemailer');
var config = require('config');
var ejs = require('ejs');
var fs = require('fs')

var users = exports;

users.sendResetPasswordToken = function(params, callback) {

  var tplfile = __dirname + '/templates/resetPasswordToken.ejs';

  fs.readFile(tplfile, 'utf8', function (err, tpl) {
    if (err) return callback(err);

    var url = "http://"+config.get('server')['domain']+":"+config.get('server')['port']+"/resetpassword/"+params.token;
    var html = ejs.render(tpl, { url: url});

    var transporter = nodemailer.createTransport(config.get('mail')['transport']);

      transporter.sendMail({
        from: config.get('mail')['fromName']+" <"+config.get('mail')['fromEmail']+">",
        to: params.email,
        subject: 'Insider Focus - Reset password',
        html: html
      }, callback);
    });
};

users.sendResetPasswordSuccess = function(params, callback) {

  var tplfile = __dirname + '/templates/resetPasswordSuccess.ejs';

  fs.readFile(tplfile, 'utf8', function (err, tpl) {
    if (err) return callback(err);

    var html = ejs.render(tpl, {});

    var transporter = nodemailer.createTransport(config.get('mail')['transport']);

    transporter.sendMail({
      from: config.get('mail')['fromName']+" <"+config.get('mail')['fromEmail']+">",
      to: params.email,
      subject: 'Insider Focus - Reset password Success',
      html: html
    }, callback);
  });
};

