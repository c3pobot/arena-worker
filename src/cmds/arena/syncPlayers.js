'use strict'
const swgohClient = require('src/swgohClient')
const CheckArena = require('./checkArena')
module.exports = async(players = [], chId, sId)=>{
  if(!players || players?.length == 0) return
  let data = await swgohClient.fetchArenaPlayers(players)
  if(data?.length > 0) await CheckArena(data, chId, sId)
}
