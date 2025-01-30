'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const arrayToObject = require('./arrayToObject')

const { dataList } = require('./dataList')
const updateUnitsList = async()=>{
  let units = (await mongo.find('autoComplete', {_id: 'unit'}, {data: {value: 0}}))[0]
  if(!units?.data || units?.data?.length == 0) return
  let tempUnits = arrayToObject(units.data, 'baseId')
  if(Object.values(tempUnits)?.length > 0){
    dataList.unitList = tempUnits
    return true
  }
}
const update = async( data )=>{
  try{
    if(data?.logLevel){
      log.setLevel(data?.logLevel);
      log.info(`Log level set to ${data?.logLevel}`)
      log.debug(`Log level set to ${data?.logLevel}`)
      return
    }
    let status = mongo.status()
    if(status) status = await updateUnitsList()
    if(status){
      let msg = 'dataList updated'
      if(data?.gameVersion) msg += ` to version ${data?.gameVersion}...`
      log.info(msg)
      return
    }
    setTimeout(()=>update(data))
  }catch(e){
    log.error(e)
    setTimeout(()=>update(data))
  }
}
update()
module.exports = update
