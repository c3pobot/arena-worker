'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const getShardName = require('./getShardName')

module.exports = async(watch = {}, obj = [], shard = {})=>{
  try{
    if(!watch.notify || !obj || obj?.length == 0) return
    let content
    for(let i in obj){
      if(obj[i].rank < watch.startRank && obj[i].rank < obj[i].oldRank && (watch.status == 'all' || obj[i].oldRank >= watch.startRank)){
        if(!content) content = (watch.roleId ? '<@&'+watch.roleId+'> ':'')+getShardName(obj[i])+' Enemy Watch : \n'
        content += (obj[i].emoji ? obj[i].emoji+' ':'')+'**'+obj[i].name+'** climbed '
        if(watch.status == 'all'){
          content += 'from **'+obj[i].oldRank+'** to '
        }else{
          content += ' past **'+watch.startRank+'**. New rank '
        }
        content += '**'+obj[i].rank+'**\n'
      }
    }
    if(content) botRequest('sendMsg', { sId: shard.sId, shardId: shard._id, chId: watch.chId, msg: { content: content } })
  }catch(e){
    log.error(e)
  }
}
