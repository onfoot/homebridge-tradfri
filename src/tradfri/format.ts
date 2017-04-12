'use strict'

import { _ } from 'lodash'

const lightMap = {
  '5850': 'power',
  '5851': 'brightness',
  '5712': 'transitionTime',
  '5709': 'colorX',
  '5710': 'colorY'
}

const deviceMap = {
  '9003': 'deviceId',
  '5750': 'type',
  '9001': 'name',
  '3311': 'light'
}

export module format {
  export function compact(object: any) {
    let keys = {}
    if (object.light !== undefined) {
      keys = _.invert(lightMap)
      object.light = object.light.map((light) => {
        return _.mapKeys(light, (value, key) => {
          return keys[key] ? keys[key] : key
        })
      })
    }
    keys = _.invert(deviceMap)
    return _.mapKeys(object, (value, key) => {
      return keys[key] ? keys[key] : key
    })
  };

  export function readable(object) {
    let device = _.mapKeys(object, (value, key) => {
      return deviceMap[key] ? deviceMap[key] : key
    })
    if (device.light === undefined) {
      return device
    }
    device.light = device.light.map((light) => {
      return _.mapKeys(light, (value, key) => {
        return lightMap[key] ? lightMap[key] : key
      })
    })
    return device
  }
}