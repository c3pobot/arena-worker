'use strict'
const log = require('logger')
const { dataCache } = require('src/cache')

const { dataList } = require('./dataList')
let notify
const updateUnitsList = async()=>{
  let units = await dataCache.all('unitMap', {})
  if(!units || units?.length == 0) return

  dataList.unitList = new Map(units.map(x=>[x.baseId, x]))
  return true
}
const update = async( data )=>{
  try{
    let status = dataCache.status()
    if(status) status = await updateUnitsList()
    if(status){
      let msg = 'dataList updated'
      if(data?.gameVersion) msg += ` to version ${data?.gameVersion}...`
      log.info(msg)
      return true
    }
  }catch(e){
    log.error(e)
  }
}
const start = async()=>{
  try{
    let status = dataCache.status()
    if(status) status = await update()
    if(status) return
    setTimeout(start, 5000)
  }catch(e){
    log.error(e)
    setTimeout(start, 5000)
  }
}
start()
module.exports = update
