'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const getShardName = require('./getShardName')

module.exports = async(watch = {}, obj = [], shard = {})=>{
  try{
    if(!obj || obj?.length == 0) return
    let watchObj = {}, shardName = getShardName(obj[0])
    for(let i in obj){
      if(watch[obj[i].allyCode] && obj[i].poHour >= 0){
        let tempWatch = watch[obj[i].allyCode]
        if(tempWatch.startTime > obj[i].poHour || (tempWatch.startRank && tempWatch.startRank > obj[i].rank)){
          if(tempWatch.moveDir == 'both' || (tempWatch.moveDir == 'up' && obj[i].oldRank > obj[i].rank) || (tempWatch.moveDir == 'down' && obj[i].oldRank < obj[i].rank)){
            if(!watchObj[tempWatch.chId]) watchObj[tempWatch.chId] = ''
            watchObj[tempWatch.chId] += (tempWatch.roleId ? '<@&'+tempWatch.roleId+'> ':'')+shardName+' Watch : '+(obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** '+(obj[i].rank > obj[i].oldRank ? 'dropped':'climbed')+' from **'+obj[i].oldRank+'** to **'+obj[i].rank+'**\n'
          }
        }
      }
    }
    for(let i in watchObj){
      botRequest('sendMsg', { sId: shard.sId, shardId: shard._id, chId: i, msg: { content: watchObj[i] } })
    }
  }catch(e){
    log.error(e)
  }
}
