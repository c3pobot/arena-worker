'use strict'
const { arenaCache } = require('src/cache')
module.exports = async(shardId)=>{
  try{
    if(shardId) return await arenaCache.get('payoutServers', { _id: shardId })
  }catch(e){
    throw(e);
  }
}
