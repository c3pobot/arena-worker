'use strict'
const log = require('logger');
const rabbitmq = require('rabbitmq-client');

const POD_NAME = process.env.POD_NAME || 'po-worker'
const connectOptions = {
  hostname: process.env.MESSAGE_BUS_HOST || 'rabbitmq-cluster.datastore',
  port: +process.env.MESSAGE_BUS_PORT || 5672,
  username: process.env.MESSAGE_BUS_USER,
  password: process.env.MESSAGE_BUS_PASS,
}
const client = new rabbitmq.Connection(connectOptions)
client.on('error', (err)=>{
  log.error(`Producer on ${POD_NAME} Error`)
  if(err?.code){
    log.error(err.code)
    log.error(err.message)
    return
  }
  log.error(err)
})
client.on('connection', ()=>{
  clientReady = true
  log.info(`messagebus client on ${POD_NAME} connection successfully (re)established`)
})
module.exports = client
