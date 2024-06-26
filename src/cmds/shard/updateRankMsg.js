'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const { botRequest, GetRanks, GetShardName } = require('src/helpers')

module.exports = async(shardId, shardCache = [])=>{
  try{
    let shard = (await mongo.find('payoutServers', {_id: shardId}))[0]
    if(!shard?.rankChannel) return

    if(!shard.rankMsgs){
      let rankMsgInfo = (await mongo.find('shardMessages', {_id: shard.sId+'-'+shard.rankChannel}))[0]
      if(rankMsgInfo?.msgId){
        shard.rankMsgs = [rankMsgInfo.msgId]
        await mongo.set('payoutServers', {_id: shard._id}, {rankMsgs: shard.rankMsgs})
      }
    }
    if(!shard?.rankMsgs || shard?.rankMsgs?.length == 0) return

    let rankMsg = await GetRanks(shard, shardCache, true)
    if(!rankMsg || rankMsg?.length == 0) return

    let defaultMsg = 'List should update about every 2 minutes\n:rage: is enemy :shrug: is unknown.\nThe bot could stall so if it looks like it is not updating tag scuba\n'
    let fieldLength = +rankMsg.length, numMsgs = +shard.rankMsgs.length
    if(fieldLength > 5 && numMsgs == 1) numMsgs = Math.round( +fieldLength / 5)
    if(fieldLength > 5 && numMsgs == 1) numMsgs = 2
    if(numMsgs > 1) fieldLength = Math.round( +rankMsg.length / numMsgs)
    let embeds = []
    let embedMsg = {
      color: 15844367,
      fields: []
    }
    let count = 0
    for(let i in rankMsg){
      if(i == 0){
        embedMsg.title = GetShardName(shard)+' Arena Ranks'
        embedMsg.description = (shard.message == 'default' ? defaultMsg:shard.message.replace('<br>', '\n'))
      }
      embedMsg.fields.push(rankMsg[i])
      count++
      if(+i + 1 == rankMsg.length && count < fieldLength) count = +fieldLength
      if(+i + 1 == rankMsg.length){
        embedMsg.timestamp = new Date()
        embedMsg.footer = {text: 'Updated'}
      }
      if(count == fieldLength){
        embeds.push(JSON.parse(JSON.stringify(embedMsg)))
        delete embedMsg.title
        delete embedMsg.description
        embedMsg.fields = []
        count = 0
      }
    }
    await botRequest('editMsg', { sId: shard.sId, shardId: shard?._id, chId: shard.rankChannel, msgId: shard.rankMsg || shard.rankMsgs[0], msg: { embeds: embeds }})
  }catch(e){
    log.error(e)
  }
}
