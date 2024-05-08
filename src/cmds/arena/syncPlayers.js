'use strict'
const { fetchArenaPlayers } = require('src/helpers')
const checkArena = require('./checkArena')
module.exports = async(players = [], chId, sId, patreonId, guildId)=>{
  if(!players || players?.length == 0) return
  let data = await fetchArenaPlayers(players)
  if(data?.length > 0) await checkArena(data, chId, sId, patreonId, guildId)
}
