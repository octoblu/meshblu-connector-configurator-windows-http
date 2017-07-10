#!/usr/bin/env node
const OctoDash = require('octodash')
const packageJSON = require('./package.json')
const { MeshbluConnectorConfigurator } = require('./lib/configurator')
const { getSerialNumber } = require('./lib/helpers')

const CLI_OPTIONS = [
  {
    names: ['configuration-base-url'],
    type: 'string',
    required: true,
    env: 'MESHBLU_CONNECTOR_CONFIGURATOR_PI_HTTP_CONFIGURATION_BASE_URL',
    help: "Base location where the configuration can be found. The Pi's serial number will be appended to the path.",
    helpArg: 'URL',
    default: 'https://security-agency.smart.octo.space/configurations/',
  },
  {
    names: ['connector-home'],
    type: 'string',
    required: true,
    env: 'MESHBLU_CONNECTOR_HOME',
    help: 'Base location of meshblu connectors',
    helpArg: 'PATH',
    completionType: 'file',
  },
  {
    names: ['pm2-home'],
    type: 'string',
    required: true,
    env: 'MESHBLU_CONNECTOR_PM2_HOME',
    help: 'Base location of meshblu-connector-pm2',
    helpArg: 'PATH',
    completionType: 'file',
  },
  {
    names: ['serial-number'],
    type: 'string',
    required: true,
    env: 'MESHBLU_CONNECTOR_CONFIGURATOR_WINDOWS_HTTP_SERIAL_NUMBER',
    help: 'serial number override',
    helpArg: 'SERIAL_NUMBER',
    default: getSerialNumber(),
  },
]

class MeshbluConnectorConfiguratorCommand {
  constructor({ argv, cliOptions = CLI_OPTIONS } = {}) {
    this.octoDash = new OctoDash({
      argv,
      cliOptions,
      name: packageJSON.name,
      version: packageJSON.version,
    })
  }

  run() {
    const options = this.octoDash.parseOptions()
    const { configurationBaseUrl, connectorHome, pm2Home, serialNumber } = options

    const configurator = new MeshbluConnectorConfigurator({ configurationBaseUrl, connectorHome, pm2Home, serialNumber })
    return configurator.configurate()
  }

  die(error) {
    this.octoDash.die(error)
  }
}

const command = new MeshbluConnectorConfiguratorCommand({ argv: process.argv })
command
  .run()
  .catch((error) => {
    command.die(error)
  })
  .then(() => {
    process.exit(0)
  })
