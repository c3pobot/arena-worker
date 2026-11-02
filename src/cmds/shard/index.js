'use strict'
const log = require('logger')
const { arenaCache, swgohCache } = require('src/cache')
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
  let shard = await arenaCache.get('payoutServers', { _id: data.id })
  if(!shard || !shard?.status || shard.type == 'char') return

  checkRotations(shard)
  let shardPlayers = await arenaCache.all('shardPlayers', { _id: { $regex: shard._id } }, { _id :0 })
  if(!shardPlayers || shardPlayers?.length == 0) return

  let playersFormated = await fetchArenaPlayers(shardPlayers)
  if(!playersFormated || playersFormated?.length == 0) return

  let watchObj = await arenaCache.all('shardWatch', { shardId: shard._id })
  let ranks = await syncRanks(shardPlayers, playersFormated, shard, watchObj);
  if(!ranks) return
  //update stats
  let statNameKey = `poserver.${data.id}`
  swgohCache.set('meta', { _id: 'bot-stats' }, { [statNameKey]: { id: data.id, players: shardPlayers?.length }})

  let shardCache = ranks?.shard || []
  updateRankMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
  updatePayoutMsg(shard._id, JSON.parse(JSON.stringify(shardCache)))
  SendWatchMsg(shard.watch, ranks.watch, shard)
  CheckRules(shard._id, ranks.rules, JSON.parse(JSON.stringify(shardCache)))
  SendEnemyWatchMsg(shard.enemyWatch, ranks.enemyWatch, shard)

  if(ranks.start){
    SendStartMsg(shard.logChannel, ranks.start.main, shard)
    //SendStartMsg(shard.altChannel, ranks.start.alt, shard)
  }
  if(ranks.po){
    SendPayoutMsg(shard.logChannel, ranks.po.main, shard)
    //SendPayoutMsg(shard.altChannel, ranks.po.alt, shard)
  }

  reportSyncTime(data.id, timeStart)
}
