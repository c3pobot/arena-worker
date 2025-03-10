'use strict'
const mongo = require('mongoclient')
const syncRank = require('./syncRank')

module.exports = async(player = {}, sId, chId)=>{
  if(!player.playerId) return
  let rankCache = (await mongo.find('rankCache', { _id: player.playerId }))[0]
  let pObj = (await mongo.find('arena', { _id: player.playerId }))[0]
  await syncRank(player, rankCache, pObj, sId, chId)
}
