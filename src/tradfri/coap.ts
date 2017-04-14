'use strict'

import * as os from 'os'; 
import * as util from 'util'; 
import { spawn } from 'child_process';
import * as Queue from 'promise-queue';

let queue = new Queue(1, Infinity)

export module COAP {
  export class Client {
    log: (format: string, message: any) => void;
    hostname: string;
    port: string;
    psk: string;
    binary: string;

    constructor (log, config, hostname, port) {
      this.log = log
      this.hostname = hostname
      this.port = port
      this.psk = config.psk

      if (config.coapClientPath) {
        this.binary = config.coapClientPath
      } else {
        this.binary = __dirname + '/../../bin/coap-client-' + os.platform()
      }

      this.log("Using COAP client binary:", this.binary)
    }

    get (uri) {
      return queue.add(() => {
        return new Promise((resolve, reject) => {
          const endpoint = util.format('coaps://%s:%s%s',
            this.hostname, this.port, uri)

          this.log('GET:', endpoint)

          const cmd = spawn(this.binary, ['-u', 'Client_identity',
            '-k', this.psk, endpoint
          ])

          let resp = ""
          cmd.stdout.on('data', (data) => resp += data)
          cmd.stderr.on('data', (data) => reject(data))
          cmd.on('close', (code) => {
            let split = resp.split('\n')
            split = split.filter((line) => line !== '')
            resolve(split.pop())
          })
        })
      })
    }

    put (uri, payload) {
      return queue.add(() => {
        return new Promise((resolve, reject) => {
          const endpoint = util.format('coaps://%s:%s%s',
            this.hostname, this.port, uri)

          this.log('PUT:', endpoint)

          const cmd = spawn(this.binary, ['-f', '-', '-u', 'Client_identity',
            '-k', this.psk, '-m', 'put', endpoint
          ])

          cmd.stdin.write(JSON.stringify(payload))
          cmd.stdin.end()

          cmd.stderr.on('data', (data) => reject(data))
          cmd.on('close', (code) => resolve(code))
        })
      })
    }
  } 
}