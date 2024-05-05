'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')

module.exports = async(obj = {})=>{
  try{
    if(obj.rank > obj.oldRank || obj.climb){
      let discordId = await getDiscordId(obj)
      if(!discordId) return
      let embedMsg = {
        color: obj.rank > obj.oldRank ? 15158332 : 3066993,
        description: getShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji+' ':'')+'**'+obj.name+'** '
      }
      embedMsg.description += (obj.rank > obj.oldRank ? 'dropped':'climbed')+' from **'+obj.oldRank+'** to **'+obj.rank+'**.\n'
      if(obj.swap){
        embedMsg.description += (obj.rank > obj.oldRank ? 'Bumped by':'Dropped')+' '+(obj.swap.emoji ? obj.swap.emoji+' ':'')+'**'+obj.swap.name+'**'
      }
      botRequest('sendDM', { sId: obj.sId, shardId: obj.shardId, patreonId: obj.patreonId, guildId: obj.guildId, dId: discordId, msg: { embeds: [embedMsg] } })
    }
  }catch(e){
    log.error(obj)
  }
}
