'use strict'
const mongo = require('mongoclient')
const SyncRank = require('./syncRank')
module.exports = async(players = [], chId = null, sId, patreonId, guildId)=>{
  if(!players || players?.length == 0) return
  let allyCodes = players.map(u=>+u.allyCode)
  let rankCache = await mongo.find('rankCache', { allyCode: { $in: allyCodes } })
  let pSettings = await mongo.find('arena', { allyCode: { $in: allyCodes } })
  if(!pSettings || !rankCache) return
  let array = [], i = players.length
  while(i--){
    let oldData = rankCache.find(x=>x._id == players[i].playerId)
    let pObj = pSettings.find(x=>x._id == players[i].playerId)
    array.push(SyncRank(players[i], oldData, pObj, chId, sId, patreonId, guildId))
  }
  await Promise.allSettled(array)
}
