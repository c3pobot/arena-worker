'use strict'
const log = require('logger')
const SyncPlayers = require('./syncPlayers')
const swgohClient = require('src/swgohClient')
const mongo = require('mongoclient')
module.exports = async(data = {})=>{
  //data format { name: 'arena', patreonId: patreonId }
  if(!data.patreonId) return
  let players = [], guilds = [], users = []
  let patreon = (await mongo.find('patreon', {_id: data.patreonId}))[0]
  if(patreon?.guilds) guilds = Object.values(patreon.guilds)
  if(patreon?.users) users = Object.values(patreon.users)
  if(guilds?.length > 0){
    for(let i in guilds){
      //console.log('starting sync for guild '+guilds[i].id)
      let guild = await swgohClient.queryGuild(guilds[i].id)
      if(guild?.member?.length > 0) await SyncPlayers(guild.member, guilds[i].chId, guilds[i].sId)
    }
  }
  if(users?.length > 0) await SyncPlayers(users, patreon.logChannel, patreon.sId)
}
