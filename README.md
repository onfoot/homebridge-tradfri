# homebridge-tradfri
[![NPM Version](https://img.shields.io/npm/v/homebridge-tradfri.svg)](https://www.npmjs.com/package/homebridge-tradfri)

IKEA Trådfri Gateway plugin for [Homebridge](https://github.com/nfarina/homebridge).

## Installation

1. Install Homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-tradfri`
3. Update your configuration file. See the sample below.

## Sample Configuration

The PSK (Pre-Shared Key) can be found printed on the bottom of the IKEA Trådfri Gateway.
This plugin makes use of coap-client which is part of libcoap. 

The plugin comes with prebuilt x86-64 binaries for macOS and Linux. There is no need to compile ```coap-client``` if this is what you're using. If not, you'll need to compile ```coap-client``` yourself and use the config property ```coapClientPath``` to point to the location of the ```coap-client``` binary.
```js
"platforms": [{
    "platform" : "Tradfri",
    "name" : "Tradfri",
    "psk" : "23asqw9123j33",
    "coapClientPath": "/usr/local/bin/coap-client" // OPTIONAL: See above
}],
```

## Compiling libcoap
Installing [libcoap](https://github.com/obgm/libcoap) as per the following instructions for Debian/Ubuntu:
```shell
$ apt-get install libtool git build-essential install autoconf automake
$ git clone --recursive https://github.com/obgm/libcoap.git
$ cd libcoap
$ git checkout dtls
$ git submodule update --init --recursive
$ ./autogen.sh
$ ./configure --disable-documentation --disable-shared
$ make
```

You'll find the ```coap-client``` binary in ```./examples```