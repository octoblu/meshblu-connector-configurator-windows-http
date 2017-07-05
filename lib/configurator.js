const axios = require("axios")
const bindAll = require("lodash/fp/bindAll")
const map = require("lodash/fp/map")
const path = require("path")
const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const fs = require("fs-extra")
const debug = require("debug")("meshblu-connector-configurator-windows-http:configurator")
const { MeshbluConnectorDaemon } = require("meshblu-connector-daemon")

class MeshbluConnectorConfigurator {
  constructor({ connectorHome, pm2Home, username }) {
    bindAll(Object.getOwnPropertyNames(MeshbluConnectorConfigurator.prototype), this)
    if (!connectorHome) throw new Error('Missing required parameter: connectorHome')
    if (!pm2Home) throw new Error('Missing required parameter: pm2Home')
    if (!username) throw new Error('Missing required parameter: username')

    this.pm2Home = pm2Home
    this.username = username
    this.connectorHome = connectorHome
    this.connectorsPath = path.resolve(path.join(connectorHome, "connectors"))
  }

  configurate() {
    return axios.get(`https://s3-us-west-2.amazonaws.com/genisys-automatic-configuration/windows/${this.username}/connectors.json`)
      .then(response => Promise.all(map(this.daemonize, response.data)))
  }

  daemonize({ domain, token, type, uuid }) {
    debug(`Daemonizing ${uuid}:${type}`)
    const { connectorsPath, pm2Home } = this
    const daemon = new MeshbluConnectorDaemon({ uuid, type, token, domain, connectorsPath, pm2Home })
    return daemon.start()
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
