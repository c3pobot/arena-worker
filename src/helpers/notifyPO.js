'use strict'
const log = require('logger')
const discordMsg = require('./discordMsg')
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
    let opts = {}
    if(obj.sId){
      opts.sId = obj.sId
    }else{
      opts.shardId = 0
    }
    await discordMsg(opts, {method: 'sendDM', dId: discordId, msg: {embeds: [embedMsg]}})
  }catch(e){
    log.error(e)
  }
}
