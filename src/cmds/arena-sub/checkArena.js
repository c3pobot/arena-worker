'use strict'
const { arenaCache } = require('src/cache')
const syncRank = require('./syncRank')

module.exports = async(player = {}, sId, chId)=>{
  if(!player.playerId) return
  let rankCache = await arenaCache.get('rankCache', { _id: player.playerId })
  let pObj = await arenaCache.get('arena', { _id: player.playerId })
  await syncRank(player, rankCache, pObj, sId, chId)
}
