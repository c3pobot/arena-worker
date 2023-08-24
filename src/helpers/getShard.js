'use strict'
const mongo = require('mongoclient')
module.exports = async(shardId)=>{
  try{
    if(shardId) return (await mongo.find('payoutServers', {_id: shardId}))[0]
  }catch(e){
    throw(e);
  }
}
