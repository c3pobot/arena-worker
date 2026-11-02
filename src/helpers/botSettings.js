const log = require('logger')
const { swgohCache } = require('src/cache')

let botSettings = {}, mongoReady = swgohCache.status(), notify = true
const update = async()=>{
  try{
    let syncTime = 5
    if(!mongoReady) mongoReady = swgohCache.status()
    if(mongoReady){
      let data = await swgohCache.get('botSettings', { _id: '1' }, { _id: 0, TTL: 0 })
      if(data){
        for(let i in data) botSettings[i] = data[i]
        botSettings.ready = true
        if(notify){
          notify = false
          log.info(`updated botSettings...`)
        }
        syncTime = 60
      }
    }
    setTimeout(update, syncTime * 1000)
  }catch(e){
    log.error(e)
    setTimeout(update, 5000)
  }
}
update()
module.exports = { botSettings }
