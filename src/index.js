'use strict'
const log = require('logger')
//log.setLevel('debug');
const mongo = require('mongoclient')

const rabbitmq = require('./helpers/rabbitmq')
const swgohClient = require('./swgohClient')
const updateDataList = require('./helpers/updateDataList')
const dataSync = require('./dataSync')
require('./exchanges')
const { botSettings } = require('./helpers/botSettings')
const { dataList } = require('./helpers/dataList')

const POD_NAME = process.env.POD_NAME || 'po-worker'

let cmdQue = require('./cmdQue')

const checkRabbitmq = ()=>{
  try{
    if(rabbitmq.ready){
      checkMongo()
      return
    }
    setTimeout(checkRabbitmq, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkRabbitmq, 5000)
  }
}
const checkMongo = ()=>{
  try{
    let status = mongo.status()
    if(status){
      checkAPIReady()
      return
    }
    setTimeout(checkMongo, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkMongo, 5000)
  }
}
const checkAPIReady = async()=>{
  try{
    let obj = await swgohClient.metadata()
    if(obj?.latestGamedataVersion){
      log.info('API is ready ..')
      if(POD_NAME?.toString().endsWith("0")){
        checkDataSync()
        return
      }
      await cmdQue.startConsumer()
      return
    }
    log.info('API is not ready. Will try again in 5 seconds')
    setTimeout(checkAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkAPIReady, 5000)
  }
}
const checkDataSync = async()=>{
  try{
    let status = await dataSync.start()
    if(status){
      await cmdQue.startConsumer()
      return
    }
    setTimeout(checkDataSync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkDataSync, 5000)
  }
}
checkRabbitmq()
