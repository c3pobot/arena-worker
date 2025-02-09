'use strict'
const log = require('logger')
const syncPlayers = require('./syncPlayers')
const swgohClient = require('src/swgohClient')
const mongo = require('mongoclient')
module.exports = async(data = {})=>{
  //data format { name: 'arena', id: patreonId }
  log.debug(`Started sync of patreon ${data.id}`)
  if(process.env.IS_TEST) return
  let players = [], guilds = [], users = []
  let patreon = (await mongo.find('patreon', {_id: data.id}))[0]
  if(patreon?.guilds) guilds = Object.values(patreon.guilds)
  if(patreon?.users) users = Object.values(patreon.users)
  if(guilds?.length > 0){
    for(let i in guilds){
      //console.log('starting sync for guild '+guilds[i].id)
      let guild = await swgohClient('guild', { guildId: guilds[i].id })
      guild = guild?.guild
      if(guild?.member?.length > 0) await syncPlayers(guild.member, guilds[i].chId, guilds[i].sId, data.id, guilds[i].id)
    }
  }
  if(users?.length > 0) await syncPlayers(users, patreon.logChannel, patreon.sId, data.id, null)
  log.debug(`Completed sync of patreon ${data.id}`)
}
