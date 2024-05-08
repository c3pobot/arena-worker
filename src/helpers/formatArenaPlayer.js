'use strict'
module.exports = (obj = {})=>{
  let res = {
    allyCode: +obj.allyCode,
    playerId: obj.playerId,
    name: obj.name,
    poOffSet: obj.localTimeZoneOffsetMinutes,
    arena: {
      char: {
        rank: 0,
        squad: []
      },
      ship: {
        rank: 0,
        squad: []
      }
    },
    updated: Date.now()
  }
  if(obj.pvpProfile){
    let charObj = obj.pvpProfile.find(x=>x.tab === 1)
    let shipObj = obj.pvpProfile.find(x=>x.tab === 2)
    if(charObj){
      res.arena.char.rank = charObj.rank || 0
      if(charObj.squad) res.arena.char.squad = charObj.squad.cell || []
    }
    if(shipObj){
      res.arena.ship.rank = shipObj.rank || 0
      if(shipObj.squad) res.arena.ship.squad = shipObj.squad.cell || []
    }
  }
  return res
}
