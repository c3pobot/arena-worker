'use strict'
const log = require('logger')
const mqtt = require('src/helpers/mqtt');
const fetch = require('./fetch')
const BOT_NAMESPACE = process.env.BOT_NAMESPACE || 'default', BOT_SET_NAME = process.env.BOT_SET_NAME || 'bot', BOT_SVC = process.env.BOT_SVC || 'bot', BOT_SVC_PORT = process.env.BOT_SVC_PORT || 3000
let botTopic = `k8-status/statefulset/${BOT_NAMESPACE}/${BOT_SET_NAME}`, NUM_SHARDS = 0

mqtt.on('message', (topic, msg)=>{
  try{
    if(!msg || topic !== botTopic) return
    let data = JSON.parse(msg)
    if(data.replicas !== NUM_SHARDS){
      log.info(`Number of bot shards changed from ${NUM_SHARDS} to ${data.replicas}...`)
      NUM_SHARDS = +data.replicas
    }
  }catch(e){
    log.error(e)
  }
})

const checkMQTTStatus = async()=>{
  try{
    if(mqtt.connected){
      await mqtt.subscribe(botTopic, { qos: 1, rh: true })
      return
    }
    setTimeout(checkMQTTStatus, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMQTTStatus, 5000)
  }
}
const start = async()=>{
  try{
    let opts = { method: 'GET', timeout: 60000, compress: true }
    let res = await fetch(`http://${BOT_SET_NAME}-${0}.${BOT_SVC}.${BOT_NAMESPACE}:${BOT_SVC_PORT}/getNumShards`, opts)
    if(res?.body?.totalShards > 0){
      NUM_SHARDS = +res.body.totalShards
      //checkMQTTStatus()
      log.info(`Set Number of bot shards to ${NUM_SHARDS}...`)
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
const getId = (sId)=>{
  if(NUM_SHARDS > 0 && sId > 0){
    let shardId = (Number(BigInt(sId) >> 22n) % (NUM_SHARDS))
    return shardId?.toString()
  }
}
module.exports.getId = getId
module.exports.getPodName = (sId)=>{
  if(!sId) return
  let shardId = getId()
  if(!shardId) return
  return `${BOT_SET_NAME}-${shardId}`
}
module.exports.getNumShards = ()=>{
  return NUM_SHARDS
}
