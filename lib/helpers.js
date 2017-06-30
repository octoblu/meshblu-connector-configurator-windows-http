const path = require('path')

const getUsername = function() {
  if (!process.env['USERPROFILE']) return

  const username = path.basename(process.env['USERPROFILE'])
  return `domainName/${username}`
}

module.exports = { getUsername }
