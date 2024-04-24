'use strict'
const { eachLimit } = require('async')
const mongo = require('mongoclient')
const SyncRank = require('./syncRank')
const MAX_SYNC = process.env.MAX_SYNC || 20
module.exports = async(players = [], chId = null, sId)=>{
  if(!players || players?.length == 0) return
  let allyCodes = players.map(u=>+u.allyCode)
  let rankCache = await mongo.find('rankCache', { allyCode: { $in: allyCodes } })
  let pSettings = await mongo.find('arena', { allyCode: { $in: allyCodes } })
  if(!pSettings || !rankCache) return
  let array = [], i = players.length
  while(i--){
    let oldData = rankCache.find(x=>x._id == players[i].playerId)
    let pObj = pSettings.find(x=>x._id == players[i].playerId)
    array.push(syncRank(players[i], oldData, pObj, chId, sId))
  }
  await Promise.allSettled(array)
}
