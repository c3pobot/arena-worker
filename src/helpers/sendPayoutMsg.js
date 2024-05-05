'use strict'
const log = require('logger')
const sorter = require('json-array-sorter')
const getDiscordId = require('./getDiscordId')
const getShardName = require('./getShardName')
const botRequest = require('./botrequest')

module.exports = async(chId, obj = [], shard = {})=>{
  try{
    if(!chId || !obj || obj?.length == 0) return
    let sortedObj = sorter([{column: 'rank', order: 'ascending'}], obj)
    let content, shardName = getShardName(sortedObj[0])
    let embedMsg = {
      color: 15844367,
      description: shardName + ' Arena Logs Payouts\n'
    }
    for(let i in sortedObj){
      embedMsg.description += '`'+sortedObj[i].rank.toString().padStart(3, ' ')+'` '+(sortedObj[i].emoji ? sortedObj[i].emoji+' ':'')+'**'+sortedObj[i].name+'**\n'
      if(sortedObj[i].poNotify && sortedObj[i].method == 'log'){
        let discordId = await getDiscordId(sortedObj[i])
        if(discordId){
          if(!content) content = ''
          content += '<@'+discordId+'> your payout for '+shardName+' Arena. Rank **'+sortedObj[i].rank+'**\n'
        }
      }
    }
    botRequest('sendMsg', { sId: shard.sId, shardId: shard._id, patreonId: obj.patreonId, guildId: obj.guildId, chId: chId, msg: { content: content, embeds: [embedMsg] } })
  }catch(e){
    log.error(e)
  }
}
