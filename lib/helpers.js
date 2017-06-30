const path = require('path')

const getUsername = function() {
  const userName = process.env['USERPROFILE'].split(path.sep)[2];
  return path.join("domainName",userName);
}

module.exports = { getUsername }
