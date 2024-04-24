'use strict'
const apiRequest = require('./apiRequest')
const formatArenaPlayer = require('./formatArenaPlayer')
const getArenaPlayer = async(payload = {})=>{
  try{
    if(payload.playerId) delete payload.allyCode
    let obj = await apiRequest('playerArena', payload)
    if(obj?.allyCode) return formatArenaPlayer(obj)
  }catch(e){
    throw(e);
  }
}
module.exports = async(players = [])=>{
  if(!players || players?.length == 0) return
  let array = [], i = players.length
  while(i--) array.push(getArenaPlayer({ allyCode: players[i]?.allyCode?.toString(), playerId: players[i]?.playerId }))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.allyCode)?.map(x=>x?.value)
}
