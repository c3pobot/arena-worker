'use strict'
const { arenaCache } = require('src/cache')
const SyncRank = require('./syncRank')
module.exports = async(players = [], chId = null, sId, patreonId, guildId)=>{
  if(!players || players?.length == 0) return
  let allyCodes = players.map(u=>+u.allyCode)
  let rankCache = await arenaCache.all('rankCache', { allyCode: { $in: allyCodes } })
  let pSettings = await arenaCache.all('arena', { allyCode: { $in: allyCodes } })
  if(!pSettings || !rankCache) return
  
  let array = [], i = players.length
  while(i--){
    let oldData = rankCache.find(x=>x._id == players[i].playerId)
    let pObj = pSettings.find(x=>x._id == players[i].playerId)
    array.push(SyncRank(players[i], oldData, pObj, chId, sId, patreonId, guildId))
  }
  await Promise.allSettled(array)
}
