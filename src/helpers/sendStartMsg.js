'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const getDiscordId = require('./getDiscordId')

module.exports = async(chId, obj = [], shard)=>{
  try{
    if(!chId || !obj || obj?.length == 0) return
    let content
    for(let i in obj){
      let discordId = await getDiscordId(obj[i])
      if(discordId){
        if(!content) content = ''
        content += '<@' + discordId + '> Starting notifications of rank drops in **' + (obj[i].type == 'char' ? 'Squad':'Fleet') + '** arena. Current Rank **' + obj[i].rank + '**\n'
      }
    }
    botRequest('sendMsg', { sId: shard.sId, shardId: shard._id, patreonId: obj.patreonId, guildId: obj.guildId, chId: chId, msg: { content: content } })
  }catch(e){
    log.error(e)
  }
}
