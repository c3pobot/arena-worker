'use strict'
const mongo = require('mongoclient')
const { PayoutRotations } = require('src/helpers')
module.exports = async(shard)=>{
  try{
    let obj = (await mongo.find('shardRotations', {_id: shard._id}, {_id: 0, TTL: 0}))[0]
    if(!obj) return
    for(let i in obj){
      if(obj[i] && obj[i].players && obj[i].players.length > 0 && obj[i].poOffSet && obj[i].chId) await PayoutRotations(obj[i])
    }
  }catch(e){
    log.error(e)
  }
}
