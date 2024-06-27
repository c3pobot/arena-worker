'use strict'
const mongo = require('mongoclient')
const log = require('logger')
const rabbitmq = require('./helpers/rabbitmq')

const updateDataList = require('./helpers/updateDataList')
const cmdQue = require('./cmdQue')

let POD_NAME = process.env.POD_NAME || 'arena-worker', NAME_SPACE = process.env.NAME_SPACE || 'default'
let QUE_NAME = `${NAME_SPACE}.${POD_NAME}.topic`
let DATA_EXCHANGE_NAME = process.env.GAME_DATA_EXCHANGE || `data-sync`, CONTROL_EXCHANGE_NAME = process.env.CONTROL_EXCHANGE_NAME || 'control'
let DATA_ROUTING_KEY = process.env.GAME_DATA_TOPIC || `${NAME_SPACE}.${DATA_EXCHANGE_NAME}.game-data`
let CONTROL_ROUTING_KEY = `${NAME_SPACE}.${CONTROL_EXCHANGE_NAME}.arena`

let exchanges = [{ exchange: DATA_EXCHANGE_NAME, durable: true, type: 'topic'}, { exchange: CONTROL_EXCHANGE_NAME, durable: true, type: 'topic'}]
let queueBindings = [{ exchange: DATA_EXCHANGE_NAME, routingKey: DATA_ROUTING_KEY, queue: QUE_NAME }, { exchange: CONTROL_EXCHANGE_NAME, routingKey: CONTROL_ROUTING_KEY, queue: QUE_NAME }]
let consumer
const cmdProcessor = (msg = {})=>{
  try{
    if(!msg.body || !msg.routingKey) return
    if(msg.routingKey === DATA_ROUTING_KEY) updateDataList(msg.body)
    if(msg.routingKey === CONTROL_ROUTING_KEY) cmdQue.restart(msg.body)

  }catch(e){
    log.error(e)
  }
}
const start = async()=>{
  try{
    let status = mongo.status()
    if(status) status = rabbitmq.ready
    if(!status){
      setTimeout(start, 5000)
      return
    }
    if(consumer) await consumer.close()
    consumer = rabbitmq.createConsumer({ consumerTag: POD_NAME, queue: QUE_NAME, exchanges: exchanges, queueBindings: queueBindings, queueOptions: { queue: QUE_NAME, durable: false, exclusive: true, arguments: { 'x-message-ttl': 6000 } } }, cmdProcessor)
    consumer.on('error', (err)=>{
      log.info(err)
    })
    consumer.on('ready', ()=>{
      log.info(`${POD_NAME} topic consumer created...`)
    })
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
