'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const redis = require('redisclient')

const swgohClient = require('./swgohClient')
const { botSettings } = require('./helpers/botSettings')
const { configMaps } = require('./helpers/configMaps')

let CmdQue = require('./cmdQue')

let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);

const CheckRedis = ()=>{
  try{
    let status = redis.status()
    if(status){
      CheckMongo()
      return
    }
    setTimeout(CheckRedis, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckRedis, 5000)
  }
}
const CheckMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      CheckAPIReady()
      return
    }
    setTimeout(CheckMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckMongo, 5000)
  }
}
const CheckAPIReady = async()=>{
  try{
    let obj = await swgohClient.metadata()
    if(obj?.latestGamedataVersion){
      log.info('API is ready ..')
      CmdQue.start()
      return
    }
    log.info('API is not ready. Will try again in 5 seconds')
    setTimeout(CheckAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPIReady, 5000)
  }
}
CheckRedis()
