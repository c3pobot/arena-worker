'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const formatArenaPlayer = require('src/helpers/formatArenaPlayer')

const checkArena = require('./checkArena')

const getArenaPlayer = async(allyCode)=>{
  try{
    if(!allyCode) return
    let obj = await swgohClient('playerArena', { allyCode: allyCode.toString()})
    if(obj?.allyCode) return formatArenaPlayer(obj)
  }catch(e){
    log.error(e);
  }
}
module.exports = async(data = {})=>{
  //data format { name: 'arena-sub', allyCode: allyCode, sId: ServerId, chId: ChannelId }
  log.debug(`Started sync of arena-sub ${data.allyCode}`)
  //if(process.env.IS_TEST) return
  let player = await getArenaPlayer(data.allyCode)
  if(player?.playerId) await checkArena(player, data.sId, data.chId)
  log.debug(`Completed sync of arena-sub ${data.allyCode}`)
}
