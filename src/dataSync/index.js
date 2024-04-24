'use strict'
const log = require('logger')
const cmdQue = require('src/cmdQue')
const mongo = require('mongoclient')
let queReady, shardSet = new Set()

const start = async()=>{
  try{
    let status = await cmdQue.startProducer()
    if(status){
      queReady = true
      sync()
      return
    }
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
const syncShards = async()=>{
  try{
    if(!queReady) return
    let shards = await mongo.find('payoutServers', { status: 1 })
    if(shards?.length == 0) return
    for(let i in shards){
      if(!shardSet.has(shards[i]._id)){
        let status = await cmdQue.send({ name: 'shard', shardId: shards[i]._id})
        if(status){
          shardSet.add(shards[i]._id)
          log.info(`Added ${shards[i]._id} to shard que...`)
        }
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
    setTimeout(sync, 30000)
  }catch(e){
    log.error(e)
    setTimeout(sync, 5000)
  }
}
start()
