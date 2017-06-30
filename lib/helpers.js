const getUsername = function() {
  if (!process.env['USERNAME'] || !process.env['USERDOMAIN']) return

  const domain = process.env['USERDOMAIN']
  const username = process.env['USERNAME']

  return `${domain}/${username}`
}

module.exports = { getUsername }
