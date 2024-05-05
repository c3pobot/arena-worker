'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const botRequest = require('./botrequest')
const getShardName = require('./getShardName')

module.exports = async(obj = [], shard)=>{
  try{
    if(obj.length == 0 || !shard) return
    for(let i in obj){
      let embedMsg = {
        color: 3066993,
        description: getShardName(obj[i])+' Arena Rank Watch\nThe player at rank '+obj[i].rank+' has moved',
      }
      let opts = {}
      if(obj.sId){
        opts.sId = obj.sId
      }else{
        opts.shardId = 0
      }
      botRequest('sendDM', { sId: shard.sId, shardId: shard._id, dId: obj[i].dId, msg: { embeds: [embedMsg] } })
      mongo.del('shardWatch', {_id: obj[i]._id})
    }
  }catch(e){
    log.error(e)
  }
}
