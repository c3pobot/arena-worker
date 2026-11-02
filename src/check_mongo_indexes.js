'use strict'
const { arenaCache } = require('./cache')

const collections = [
  { collection: 'arena', indexes: [ { key: { allyCode: 1 }, opts: { name: '_allyCode' } } ] },
  { collection: 'payoutServers', indexes: [ { key: {  sId: 1 }, opts: { name: '_sId' } } ] },
  { collection: 'rankCache', indexes: [ { key: { allyCode: 1 }, opts: { name: '_allyCode' } }, { key: { TTL: 1 }, opts: { name: '_TTL', expireAfterSeconds: 14 * 24 * 3600 } } ] },
  { collection: 'shardHitList', indexes: [ { key: { _id: 1, shardId: 1 }, opts: { name: '_id_shardId' } } ] },
  { collection: 'shardPlayers', indexes: [ { key: { allyCode:1, dId: 1, shardId: 1 }, opts: { name: '_allyCode_dId_shardId' } } ] },
  { collection: 'shardRankCache', indexes: [ { key: { shardId: 1 }, opts: { name: '_shardId' } }, { key: { TTL: 1 }, opts: { name: '_TTL', expireAfterSeconds: 14 * 24 * 3600 } } ] },
  { collection: 'shardWatch', indexes: [ { key: {  pId: 1, shardId: 1 }, opts: { name: '_pId_shardId' } } ] }
]

async function checkIndex( data ){
  for(let i in data?.indexes){
    let status = await arenaCache.updateIndex( data.collection, data.indexes[i].key, data.indexes[i].opts)
    if(!status) return
  }
  return true
}


module.exports = async()=>{
  if(!collections || collections.length == 0) return
  for(let i in collections){
    let status = await checkIndex(collections[i])
    if(!status) return
  }
  return true
}
