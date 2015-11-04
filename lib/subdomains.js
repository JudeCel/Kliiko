"use strict";
var config = require('config');

function url(req, subDomain, path) {
  let domain = subDomain + config.get('server')['baseDomain']
  return req.protocol + '://' + domain + getPort() + path
}


function getPort() {
  let port = '';
  if (config.get('server')['port']) {
    port = ':'+ config.get('server')['port']
  }
  return port
}

module.exports = {
  url: url
};
