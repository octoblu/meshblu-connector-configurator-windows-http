const axios = require('axios')
const Promise = require('bluebird')
const bindAll = require('lodash/fp/bindAll')
const endsWith = require('lodash/fp/endsWith')
const get = require('lodash/fp/get')
const path = require('path')
const url = require('url')
const debug = require('debug')('meshblu-connector-configurator-windows-http:configurator')
const { MeshbluConnectorDaemon } = require('meshblu-connector-daemon')

class MeshbluConnectorConfigurator {
  constructor({ configurationBaseUrl, connectorHome, pm2Home, serialNumber }) {
    bindAll(Object.getOwnPropertyNames(MeshbluConnectorConfigurator.prototype), this)
    debug('constructor', { configurationBaseUrl, connectorHome, pm2Home, serialNumber })

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
    debug('configurate')
    return this.getConnectors().then(connectors => Promise.map(connectors, this.daemonize))
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

  getConfiguration() {
    debug('getConfiguration')
    return axios.get(this.configurationUrl).catch(() => Promise.delay(10 * 1000).then(this.getConfiguration))
  }

  getConnectors() {
    debug('getConnectors')
    return this.getConfiguration().then(get('data.connectors'))
  }
}

module.exports.MeshbluConnectorConfigurator = MeshbluConnectorConfigurator
