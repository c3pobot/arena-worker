'use strict'
const log = require('logger')
const botRequest = require('./botrequest')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')

module.exports = async(obj = {})=>{
  try{
    let discordId = await getDiscordId(obj)
    if(!discordId) return
    let embedMsg = {
      color: 15844367,
      description: getShardName(obj)+' Arena Logs\n'+(obj.emoji ? obj.emoji:'')+' **'+obj.name+'** payout at Rank **' + obj.rank + '**'
    }
    botRequest('sendDM', { sId: obj.sId, shardId: obj.shardId, patreonId: obj.patreonId, guildId: obj.guildId, dId: discordId, msg: { embeds: [embedMsg] } })
  }catch(e){
    log.error(e)
  }
}
