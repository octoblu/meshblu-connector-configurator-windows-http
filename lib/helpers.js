const toLower = require('lodash/fp/toLower')

const getSerialNumber = function getSerialNumber() {
  if (!process.env.USERNAME || !process.env.USERDOMAIN) return

  const domain = process.env.USERDOMAIN
  const username = process.env.USERNAME

  return new Buffer(toLower(`${domain}\\${username}`)).toString('base64')
}

module.exports = { getSerialNumber }
