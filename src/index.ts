'use strict'

const pluginName = 'homebridge-tradfri'
const platformName = 'Tradfri'

import * as mdns from 'mdns';
import { mutil } from './tradfri/mutil';
import { tradfri } from './tradfri/tradfri';

var Accessory, Service, Characteristic, UUIDGen

module.exports = function (homebridge) {
  Accessory = homebridge.platformAccessory
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  UUIDGen = homebridge.hap.uuid
  homebridge.registerPlatform(pluginName, platformName, Tradfri, true)
}

var client = null

interface Config {
  psk: string;
}

class Tradfri {
  log: (format: string, message: any) => void;
  config: Config;
  accessories: Map<string, Lightbulb>;
  api: any;
  
  constructor (log, config, api) {
    this.log = log
    this.config = config || {}
    this.api = api
    this.accessories = new Map()

    this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this))
  }

  didFinishLaunching () {
    var sequence = [
      mdns.rst.DNSServiceResolve(),
      mdns.rst.getaddrinfo({families:[4]}),
      mdns.rst.makeAddressesUnique()
    ];

    const browser = mdns.createBrowser(mdns.udp('coap'), { resolverSequence: sequence })
    browser.on('serviceUp', (service) => {
      client = new tradfri.Client(this.log, this.config, service.addresses.pop(),
        service.port)

      client.getDevices().then((devices) => {
        devices.forEach((device) => {
          this.addAccessory(device)
        })
      }).catch((err) => {
        console.log(err)
      })
    })
    browser.on('serviceDown', (service) => {
      this.log('Service down: ', service)
    })
    browser.on('error', (error) => {
      this.log('Error:', error)
    })
    browser.start()
  }

  configureAccessory (accessory) {
    this.log('Configure accessory:', accessory)
    const lightbulb = new Lightbulb(accessory)
    this.accessories.set(accessory.context.deviceId, lightbulb)
  }

  addAccessory (device) {
    if (this.accessories.get(device.deviceId)) {
      return
    }
    this.log('Adding: %s', device.name)

    const accessory = new Accessory(device.name,
      UUIDGen.generate(device.deviceId.toString()))

    accessory.addService(Service.Lightbulb, device.name)
    accessory.context.deviceId = device.deviceId

    const lightbulb = new Lightbulb(accessory)
    this.accessories.set(device.deviceId, lightbulb)

    this.api.registerPlatformAccessories(pluginName,
      platformName, [accessory])
  }

  removeAccessory (accessory) {
    this.log('Removing: %s', accessory.accessory.displayName)
    this.accessories.delete(accessory.accessory.deviceId)

    this.api.unregisterPlatformAccessories(pluginName,
      platformName, [accessory.accessory])
  }
}

class Lightbulb {
  deviceId: string;
  accessory: any;

  constructor (accessory) {
    this.accessory = accessory
    this.deviceId = accessory.context.deviceId
    this.configure()
  }

  identify (callback) {
    callback()
  }

  configure () {
    const bulbService = this.accessory.getService(Service.Lightbulb)
    bulbService.getCharacteristic(Characteristic.On)
      .on('get', (callback) => {
        if (client === null) {
          callback(null, false)
          return
        }

        client.getDevice(this.deviceId).then((device) => {
          if (!device.light) {
            callback(null, false)
            return
          }
          let power = device.light[0].power
          callback(null, power === 1)
        })
      })
      .on('set', (value, callback) => {
        if (client === null) {
          callback()
          return
        }

        if (value === 1) {
          client.turnOn(this.deviceId)
        } else {
          client.turnOff(this.deviceId)
        }
        callback()
      })

    bulbService.getCharacteristic(Characteristic.Brightness)
      .on('get', (callback) => {
        if (client === null) {
          callback(null, 0)
          return
        }

        client.getDevice(this.deviceId).then((device) => {
          if (!device.light) {
            callback(null, 0)
            return
          }

          let brightness = device.light[0].brightness
          let scaled = mutil.scale({
            fromMax: 254,
            toMax: 100
          }, brightness)

          callback(null, scaled)
        })
      })
      .on('set', (value, callback) => {
        if (client === null) {
          callback()
          return
        }
        client.setBrightness(this.deviceId, value)
        callback()
      })
  }
}
