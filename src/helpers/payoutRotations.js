'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const botRequest = require('./botrequest')
const getPOHour = require('./getPOHour')
const getRotation = require('./getRotation')

module.exports = async(obj = {})=>{
  try{
    let poHour = await getPOHour(obj.poOffSet, obj.type)
    if(poHour > obj.startTime && obj.notifyStart == 1) await mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.notifyStart']: 0})
    if(obj.startTime > poHour && obj.notifyStart == 0){
      let msg2send = await getRotation(obj)
      if(msg2send){
        let firstPlace = obj.players.shift()
        obj.players.push(firstPlace)
        await mongo.set('shardRotations', {_id: obj.shardId}, {[obj.id+'.players']: obj.players, [obj.id+'.notifyStart']: 1})
        botRequest('sendMsg', { sId: obj.sId, shardId: obj.shardId, chId: obj.chId, msg: { content: msg2send } })
      }
    }
  }catch(e){
    log.error(e)
  }
}
