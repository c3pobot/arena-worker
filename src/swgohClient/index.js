'use strict'
const apiRequest = require('./apiRequest')
module.exports.fetchArenaPlayers = require('./fetchArenaPlayers')
module.exports.queryGuild = async(guildId, includeActivity = false)=>{
  if(!guildId) return
  let guild = await apiRequest('guild', { guildId: guildId, includeRecentGuildActivityInfo: includeActivity })
  return guild?.guild
}
module.exports.metadata = async()=>{
  return await apiRequest('metadata')
}
