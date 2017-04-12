# homebridge-tradfri
[![NPM Version](https://img.shields.io/npm/v/homebridge-tradfri.svg)](https://www.npmjs.com/package/homebridge-tradfri)

IKEA Trådfri Gateway plugin for [Homebridge](https://github.com/nfarina/homebridge).

# Installation

1. Install Homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-tradfri`
3. Update your configuration file. See the sample below.

# Sample Configuration

The PSK (Pre-Shared Key) can be found printed on the bottom of the IKEA Trådfri Gateway.

```json
"platforms": [{
    "platform" : "Tradfri",
    "name" : "Tradfri",
    "psk" : "23asqw9123j33"
}],
```
