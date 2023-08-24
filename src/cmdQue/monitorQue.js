'use strict'
const log = require('logger')
const redis = require('redisclient')
const Que = require('./que')

const QUE_NAME = process.env.SHARD_QUE_NAME || 'shardQue'
const jobFilter = ['active', 'id', 'wait', 'stalled', 'stalled-check', 'delay', 'delayed']

const removeJob = async(job)=>{
  try{
    if(job){
      let timeNow = Date.now()
      let timeStamp = job.timestamp
      if(!timeStamp) timeStamp = job.finishedOn
      if(!timeStamp) timeStamp = 130 * 1000
      const timeDiff = Math.abs(timeNow - timeStamp)
      //console.log(timeDiff)
      const state = await job.getState()
      if(state === 'failed'){
        log.info('Killing failed job '+job.id)
        await job.remove()
      }
      if(state === 'stuck' && +timeDiff > 120 * 1000){
        log.info('Killing stuck job '+job.id)
        await job.remove()
      }
      if(state === 'completed' && timeDiff > 20 * 1000){
        log.info('Removing completed job '+job.id)
        await job.remove()
      }
    }
  }catch(e){
    return
  }
}
const checkJobs = async(cmdQue)=>{
  try{
    if(cmdQue){
      let jobs = await Que.getJobs()
      for(let i in jobs) await removeJob(jobs[i])
    }
  }catch(e){
    log.error('Error with checkJobs...')
    log.error(e);
  }
}
const checkJob = async(jobId)=>{
  try{
    let job = await Que.getJob(jobId)
    if(job?.failedReason){
      log.info(`Removing ${jobId} reason ${job.failedReason}...`)
      job.moveToFailed(null, true, true)
      return true
    }
  }catch(e){
    log.error(jobId)
    log.error(e)
  }
}
const forceClear = async()=>{
  try{
    let count = 0
    let jobs = await redis.keys('bull:'+QUE_NAME+':*')
    if(!jobs || jobs.length === 0) return
    for(let i in jobs){
      let jobId = jobs[i].replace('bull:'+QUE_NAME+':','')?.split(':')[0]
      if(jobFilter.filter(x=>x === jobId).length > 0) continue
      let status = await checkJob(jobId)
      if(status) count++
    }
    if(count) log.info(`Cleared ${count} stuck jobs...`)
  }catch(e){
    log.error('Error with forceClear...')
    log.error(e);
  }
}
const Sync = async() =>{
  try{
    await forceClear()
    await checkJobs()

    let id = await redis.get('bull:'+QUE_NAME+':id')
    if(id && +id > 1000) redis.del('bull:'+QUE_NAME+':id')

    setTimeout(Sync, 5000)
  }catch(e){
    log.error(e)
    setTimeout(Sync, 5000)
  }
}
module.exports = Sync
