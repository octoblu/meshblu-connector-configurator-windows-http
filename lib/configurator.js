const axios = require('axios')
const Promise = require('bluebird')
const bindAll = require('lodash/fp/bindAll')
const endsWith = require('lodash/fp/endsWith')
const get = require('lodash/fp/get')
const map = require('lodash/fp/map')
const path = require('path')
const url = require('url')
const debug = require('debug')('meshblu-connector-configurator-windows-http:configurator')
const { MeshbluConnectorDaemon } = require('meshblu-connector-daemon')

class MeshbluConnectorConfigurator {
  constructor({ configurationBaseUrl, connectorHome, pm2Home, serialNumber }) {
    bindAll(Object.getOwnPropertyNames(MeshbluConnectorConfigurator.prototype), this)

    if (!configurationBaseUrl) throw new Error('Missing required parameter: configurationBaseUrl')
    if (!connectorHome) throw new Error('Missing required parameter: connectorHome')
    if (!pm2Home) throw new Error('Missing required parameter: pm2Home')
    if (!serialNumber) throw new Error('Missing required parameter: serialNumber')

    this.configurationUrl = this.formatConfigurationUrl({ configurationBaseUrl, serialNumber })
    this.connectorHome = connectorHome
    this.connectorsPath = path.resolve(path.join(connectorHome, 'connectors'))
    this.pm2Home = pm2Home
  }

  configurate() {
    return axios.get(this.configurationUrl).then((response) => {
      const connectors = get('data.connectors', response)
      return Promise.all(map(this.daemonize, connectors))
    })
  }

  daemonize({ domain, token, type, uuid }) {
    debug(`Daemonizing ${uuid}:${type}`)
    const { connectorsPath, pm2Home } = this
    const daemon = new MeshbluConnectorDaemon({ uuid, type, token, domain, connectorsPath, pm2Home })
    return daemon.start()
  }

  formatConfigurationUrl({ configurationBaseUrl, serialNumber }) {
    const baseUrl = (endsWith('/')) ? configurationBaseUrl : `${configurationBaseUrl}/`
    const configurationUrl = new url.URL(serialNumber, baseUrl)
    return configurationUrl.toString()
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
