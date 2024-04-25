'use strict'
const log = require('logger')
const cmdQue = require('src/cmdQue')
const mongo = require('mongoclient')
const rabbitmq = require('src/helpers/rabbitmq')

let POD_NAME = process.env.POD_NAME || 'po-worker', NAME_SPACE = process.env.NAME_SPACE || 'default'
let EXCHANGE_NAME = process.env.CONTROL_EXCHANGE_NAME || 'control', ROUTING_KEY = process.env.PO_CONTROL_ROUTING_KEY || 'default.control.po-worker'

let publisher, publisherReady, producerReady, shardSet = new Set(), patreonSet = new Set()
const createPublisher = async()=>{
  if(!rabbitmq.ready) return
  publisher = rabbitmq.createPublisher({ confirm: true, exchanges: [{ exchange: EXCHANGE_NAME, type: 'topic', durable: true, maxAttempts: 5 }]})
  publisherReady = true
  log.info(`${POD_NAME} ${ROUTING_KEY} publisher is ready...`)
  return true
}

const syncPatreon = async()=>{
  try{
    if(!producerReady) return
    let patreons = await mongo.find('patreon', {status: 1}, {_id: 1, status: 1})
    if(!patreons || patreons?.length == 0) return
    for(let i in patreons){
      if(patreonSet.has(patreons[i]._id)) continue
      let status = await cmdQue.send({ name: 'arena', patreonId: patreons[i]._id})
      if(status){
        patreonSet.add(patreons[i]._id)
        log.info(`Added ${patreons[i]._id} to patreon que...`)
      }
    }
    return true
  }catch(e){
    log.error(e)
  }
}
const syncShards = async()=>{
  try{
    if(!producerReady) return
    let shards = await mongo.find('payoutServers', { status: 1 })
    if(shards?.length == 0) return
    for(let i in shards){
      if(shardSet.has(shards[i]._id)) continue
      let status = await cmdQue.send({ name: 'shard', shardId: shards[i]._id})
      if(status){
        shardSet.add(shards[i]._id)
        log.info(`Added ${shards[i]._id} to shard que...`)
      }
    }
    return true
  }catch(e){
    log.error(e)
  }
}
const sync = async()=>{
  try{
    await syncShards()
    await syncPatreon()
    setTimeout(sync, 30000)
  }catch(e){
    log.error(e)
    setTimeout(sync, 5000)
  }
}
module.exports.start = async()=>{
  let status = await createPublisher()
  if(status) status = await cmdQue.startProducer()
  if(status){
    producerReady = true
    await publisher.send({ exchange: EXCHANGE_NAME, routingKey: ROUTING_KEY }, { cmd: 'restart', set: 'po-worker', timestamp: Date.now() })
    sync()
    return true
  }
}
