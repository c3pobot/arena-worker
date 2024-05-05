'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const timeTillPayout = require('./timeTillPayout')

module.exports = (data = {}, shard = {})=>{
  try{
    let content
    if(data.oldName != data.newName){
      if(!content) content = ''
      content += 'Player name change '+(data.emoji ? data.emoji+' ':'')+data.oldName+' -> '+(data.emoji ? data.emoji+' ':'')+data.newName+'\n'
    }
    if(data.oldOffSet != data.newOffSet){
      let oldTimeTillPO = timeTillPayout(data.oldOffSet, shard.type)
      let newTimeTillPO = timeTillPayout(data.newOffSet, shard.type)
      if(!content) content = ''
      content += 'Player '+(data.emoji ? data.emoji+' ':'')+data.newName
      if(oldTimeTillPO && newTimeTillPO){
        content += ' time till po change '+oldTimeTillPO[0]+' -> '+newTimeTillPO[0]
      }else{
        content += ' po time change'
      }
      content += '\n'
    }
    if(content && shard.adminMsg == 'channel' && shard.adminChannel) botRequest('sendMsg', {
      sId: shard.sId,
      shardId: shard._id,
      chId: shard.adminChannel,
      msg: { content: content }
    })
    if(content && shard.adminMsg == 'dm' && shard.adminUser) botRequest('sendDM', {
      sId: shard.sId,
      shardId: shard._id,
      dId: shard.adminUser,
      msg: { content: content }
    })
  }catch(e){
    log.error(e)
  }
}
