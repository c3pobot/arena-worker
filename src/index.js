'use strict'
const log = require('logger')
const mongo = require('mongoclient')

const swgohClient = require('./swgohClient')
const { botSettings } = require('./helpers/botSettings')
const { configMaps } = require('./helpers/configMaps')
const POD_NAME = process.env.POD_NAME || 'po-worker'

let CmdQue = require('./cmdQue')

let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);

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
      CmdQue.startConsumer()
      if(process.env.POD_NAME?.toString().endsWith("0")) require('./dataSync')
      return
    }
    log.info('API is not ready. Will try again in 5 seconds')
    setTimeout(CheckAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPIReady, 5000)
  }
}

CheckMongo()
