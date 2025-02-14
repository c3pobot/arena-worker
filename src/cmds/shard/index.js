'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const checkRotations = require('./checkRotations')
const syncRanks = require('./syncRanks')
const updateRankMsg = require('./updateRankMsg')
const updatePayoutMsg = require('./updatePayoutMsg')

const { fetchArenaPlayers, CheckRules, SendEnemyWatchMsg, SendWatchMsg, SendPayoutMsg, SendStartMsg } = require('src/helpers')
const reportSyncTime = (shardId, timeStart)=>{
  try{
    if(!timeStart) return
    let syncTime = (Math.floor(Date.now() - timeStart) / 1000)
    log.debug(`Completed sync of shard ${shardId} in ${syncTime} seconds...`)
  }catch(e){
    log.error(e)
  }
}
module.exports = async(data = {})=>{
  //data format { name: 'shard', id: shardId }
  log.debug(`Started sync of shard ${data.id}`)
  //if(process.env.IS_TEST) return
  let timeStart = Date.now()
  let shard = (await mongo.find('payoutServers', { _id: data.id }))[0]
  if(!shard || !shard?.status) return

  checkRotations(shard)
  let shardPlayers = await mongo.find('shardPlayers', { _id: {$regex: shard._id } }, {_id :0 })
  if(!shardPlayers || shardPlayers?.length == 0) return

  let playersFormated = await fetchArenaPlayers(shardPlayers)
  if(!playersFormated || playersFormated?.length == 0) return

  let watchObj = await mongo.find('shardWatch', { shardId: shard._id })
  let ranks = await syncRanks(shardPlayers, playersFormated, shard, watchObj);
  if(!ranks) return

  let shardCache = ranks?.shard || []
  updateRankMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
  updatePayoutMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
  SendWatchMsg(shard.watch, ranks.watch, shard)
  CheckRules(shard._id, ranks.rules, JSON.parse(JSON.stringify(shardCache)))
  SendEnemyWatchMsg(shard.enemyWatch, ranks.enemyWatch, shard)
  if(ranks.start){
    SendStartMsg(shard.logChannel, ranks.start.main, shard)
    SendStartMsg(shard.altChannel, ranks.start.alt, shard)
  }
  if(ranks.po){
    SendPayoutMsg(shard.logChannel, ranks.po.main, shard)
    SendPayoutMsg(shard.altChannel, ranks.po.alt, shard)
  }
  reportSyncTime(data.id, timeStart)
}
