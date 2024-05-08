'use strict'
const log = require('logger')
const swgohClient = require('src/swgohClient')
const formatArenaPlayer = require('./formatArenaPlayer')
const getArenaPlayer = async(payload = {})=>{
  try{
    if(payload.playerId) delete payload.allyCode
    let obj = await swgohClient('playerArena', payload)
    if(obj?.allyCode) return formatArenaPlayer(obj)
  }catch(e){
    log.error(e);
  }
}
module.exports = async(players = [])=>{
  if(!players || players?.length == 0) return
  let array = [], i = players.length
  while(i--) array.push(getArenaPlayer({ allyCode: players[i]?.allyCode?.toString(), playerId: players[i]?.playerId }))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.allyCode)?.map(x=>x?.value)
}
