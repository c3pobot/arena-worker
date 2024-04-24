'use strict'
const mqtt = require('mqtt')
const log = require('logger')
const MQTT_HOST = process.env.MQTT_HOST || 'mqtt-broker.datastore'
const MQTT_PORT = process.env.MQTT_PORT || '1883'
const POD_NAME = process.env.POD_NAME || 'worker'
let clientReady, connectMsg
let connectOptions = {
  clientId: `${POD_NAME}`,
  clean: true,
  keepalive: 60,
  connectTimeout: 30000,
  reconnectPeriod: 1000,
}
if(process.env.MQTT_USER && process.env.MQTT_PASS){
  connectOptions.username = process.env.MQTT_USER
  connectOptions.password = process.env.MQTT_PASS
}

const client = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`, connectOptions)
client.on('connect', ()=>{
  clientReady = true
  if(!connectMsg){
    connectMsg = true
    log.info(`${connectOptions.clientId} MQTT Connection successful...`)
  }
})
client.on('error', (err)=>{
  log.error(err)
})

module.exports = client
