'use strict'

import { mutil } from "./mutil";
import { format } from './format';
import { COAP } from './coap';

const serial = funcs =>
  funcs.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))

const deviceEndpoint = '/15001/'
const deviceTypes = {
  REMOTE: 0,
  LIGHTBULB: 2
}

export module tradfri {
  export const DeviceTypes = deviceTypes;

  export class Client {
    log: (format: string, message: any) => void;
    coap: COAP.Client;

    constructor (log, hostname, port, psk) {
      this.log = log
      this.coap = new COAP.Client(this.log, hostname, port, psk)
    }

    getDevices () {
      return new Promise((resolve, reject) => {
        this.coap.get(deviceEndpoint).then((resp) => {
          let ids = JSON.parse(resp)
          let funcs = ids.map((id) => {
            return () => {
              return this.coap.get(deviceEndpoint + id)
            }
          })

          serial(funcs).then((data) => {
            let devices = data.map((device) => {
              let object = JSON.parse(device)
              return format.readable(object)
            })
            devices = devices.filter((device) => {
              return device.type === deviceTypes.LIGHTBULB
            })
            resolve(devices)
          })
        }).catch((err) => {
          reject(err)
        })
      })
    }

    getDevice (deviceId) {
      return new Promise((resolve, reject) => {
        this.coap.get(deviceEndpoint + deviceId).then((resp) => {
          let object = format.readable(JSON.parse(resp))
          resolve(object)
        }).catch((err) => {
          reject(err)
        })
      })
    }

    setBrightness (deviceId, brightness) {
      return new Promise((resolve, reject) => {
        let scaled = mutil.scale({
          fromMax: 100,
          toMax: 254
        }, brightness)

        let payload = format.compact({
          light: [{
            power: (brightness > 0) ? 1 : 0,
            brightness: scaled,
            transitionTime: 5
          }]
        })

        this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    }

    turnOn (deviceId) {
      return new Promise((resolve, reject) => {
        let payload = format.compact({
          light: [{
            power: 1
          }]
        })

        this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    }

    turnOff (deviceId) {
      return new Promise((resolve, reject) => {
        let payload = format.compact({
          light: [{
            power: 0
          }]
        })

        this.coap.put(deviceEndpoint + deviceId, payload).then(() => {
          resolve()
        }).catch((err) => {
          reject(err)
        })
      })
    }
  }
}